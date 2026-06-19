package repositories

import (
	"context"

	"product-service/config"
	"product-service/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	FindAll(ctx context.Context) ([]models.Product, error)
	FindByID(ctx context.Context, id string) (*models.Product, error)
	Update(ctx context.Context, id string, product *models.Product) error
	Delete(ctx context.Context, id string) error
}

type productRepository struct {
	collection *mongo.Collection
}

func NewProductRepository() ProductRepository {
	return &productRepository{
		collection: config.DB.Collection("products"),
	}
}

func (r *productRepository) Create(ctx context.Context, product *models.Product) error {
	res, err := r.collection.InsertOne(ctx, product)
	if err == nil {
		product.ID = res.InsertedID.(primitive.ObjectID)
	}
	return err
}

func (r *productRepository) FindAll(ctx context.Context) ([]models.Product, error) {
	var products []models.Product
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &products); err != nil {
		return nil, err
	}
	if products == nil {
		products = []models.Product{}
	}
	return products, nil
}

func (r *productRepository) FindByID(ctx context.Context, id string) (*models.Product, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var product models.Product
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&product)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Update(ctx context.Context, id string, product *models.Product) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"name":  product.Name,
			"price": product.Price,
			"stock": product.Stock,
		},
	}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}

func (r *productRepository) Delete(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}
