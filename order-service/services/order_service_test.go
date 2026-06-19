package services

import (
	"context"
	"errors"
	"testing"

	"order-service/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Mocks
type mockProductClient struct {
	GetProductFunc    func(productID string) (*models.ProductResponse, error)
	UpdateProductFunc func(productID string, product *models.ProductResponse) error
}

func (m *mockProductClient) GetProduct(productID string) (*models.ProductResponse, error) {
	return m.GetProductFunc(productID)
}

func (m *mockProductClient) UpdateProduct(productID string, product *models.ProductResponse) error {
	return m.UpdateProductFunc(productID, product)
}

type mockOrderRepository struct {
	CreateFunc  func(ctx context.Context, order *models.Order) error
	FindAllFunc func(ctx context.Context) ([]models.Order, error)
}

func (m *mockOrderRepository) Create(ctx context.Context, order *models.Order) error {
	return m.CreateFunc(ctx, order)
}

func (m *mockOrderRepository) FindAll(ctx context.Context) ([]models.Order, error) {
	return m.FindAllFunc(ctx)
}

func TestCreateOrder_Success(t *testing.T) {
	mockRepo := &mockOrderRepository{
		CreateFunc: func(ctx context.Context, order *models.Order) error {
			order.ID = primitive.NewObjectID()
			return nil
		},
	}
	mockClient := &mockProductClient{
		GetProductFunc: func(productID string) (*models.ProductResponse, error) {
			return &models.ProductResponse{ID: productID, Name: "Test Product", Stock: 10, Price: 100}, nil
		},
		UpdateProductFunc: func(productID string, product *models.ProductResponse) error {
			if product.Stock != 5 {
				t.Errorf("Expected stock to be 5, got %d", product.Stock)
			}
			return nil
		},
	}

	service := NewOrderService(mockRepo, mockClient)
	order := &models.Order{ProductID: "prod-1", Quantity: 5}

	err := service.CreateOrder(context.Background(), order)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
}

func TestCreateOrder_InsufficientStock(t *testing.T) {
	mockRepo := &mockOrderRepository{}
	mockClient := &mockProductClient{
		GetProductFunc: func(productID string) (*models.ProductResponse, error) {
			return &models.ProductResponse{ID: productID, Name: "Test Product", Stock: 2, Price: 100}, nil
		},
	}

	service := NewOrderService(mockRepo, mockClient)
	order := &models.Order{ProductID: "prod-1", Quantity: 5}

	err := service.CreateOrder(context.Background(), order)
	if err != ErrInsufficientStock {
		t.Fatalf("Expected ErrInsufficientStock, got: %v", err)
	}
}

func TestCreateOrder_ProductNotFound(t *testing.T) {
	mockRepo := &mockOrderRepository{}
	mockClient := &mockProductClient{
		GetProductFunc: func(productID string) (*models.ProductResponse, error) {
			return nil, errors.New("product not found")
		},
	}

	service := NewOrderService(mockRepo, mockClient)
	order := &models.Order{ProductID: "prod-unknown", Quantity: 5}

	err := service.CreateOrder(context.Background(), order)
	if err != ErrProductNotFound {
		t.Fatalf("Expected ErrProductNotFound, got: %v", err)
	}
}
