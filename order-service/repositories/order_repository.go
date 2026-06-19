package repositories

import (
	"context"
	"time"

	"order-service/config"
	"order-service/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) error
	FindAll(ctx context.Context) ([]models.Order, error)
	DeleteByProductID(ctx context.Context, productID string) error
}

type orderRepository struct {
	collection *mongo.Collection
}

func NewOrderRepository() OrderRepository {
	return &orderRepository{
		collection: config.DB.Collection("orders"),
	}
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	order.CreatedAt = time.Now()
	res, err := r.collection.InsertOne(ctx, order)
	if err == nil {
		order.ID = res.InsertedID.(primitive.ObjectID)
	}
	return err
}

func (r *orderRepository) FindAll(ctx context.Context) ([]models.Order, error) {
	var orders []models.Order
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []models.Order{}
	}
	return orders, nil
}

func (r *orderRepository) DeleteByProductID(ctx context.Context, productID string) error {
	_, err := r.collection.DeleteMany(ctx, bson.M{"productId": productID})
	return err
}
