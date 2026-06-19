package services

import (
	"context"
	"testing"

	"product-service/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type mockProductRepository struct {
	CreateFunc   func(ctx context.Context, product *models.Product) error
	FindAllFunc  func(ctx context.Context) ([]models.Product, error)
	FindByIDFunc func(ctx context.Context, id string) (*models.Product, error)
	UpdateFunc   func(ctx context.Context, id string, product *models.Product) error
	DeleteFunc   func(ctx context.Context, id string) error
}

func (m *mockProductRepository) Create(ctx context.Context, product *models.Product) error { return m.CreateFunc(ctx, product) }
func (m *mockProductRepository) FindAll(ctx context.Context) ([]models.Product, error) { return m.FindAllFunc(ctx) }
func (m *mockProductRepository) FindByID(ctx context.Context, id string) (*models.Product, error) { return m.FindByIDFunc(ctx, id) }
func (m *mockProductRepository) Update(ctx context.Context, id string, product *models.Product) error { return m.UpdateFunc(ctx, id, product) }
func (m *mockProductRepository) Delete(ctx context.Context, id string) error { return m.DeleteFunc(ctx, id) }

func TestCreateProduct_Success(t *testing.T) {
	mockRepo := &mockProductRepository{
		CreateFunc: func(ctx context.Context, product *models.Product) error {
			product.ID = primitive.NewObjectID()
			return nil
		},
	}

	service := NewProductService(mockRepo)
	product := &models.Product{Name: "Obat Paracetamol", Price: 15000, Stock: 100}

	err := service.CreateProduct(context.Background(), product)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
}

func TestCreateProduct_InvalidData(t *testing.T) {
	mockRepo := &mockProductRepository{}
	service := NewProductService(mockRepo)
	
	// Negative stock
	product := &models.Product{Name: "Obat Pusing", Price: 100, Stock: -5}
	err := service.CreateProduct(context.Background(), product)
	if err == nil {
		t.Fatalf("Expected error for negative stock, got nil")
	}

	// Empty name
	product = &models.Product{Name: "", Price: 100, Stock: 10}
	err = service.CreateProduct(context.Background(), product)
	if err == nil {
		t.Fatalf("Expected error for empty name, got nil")
	}
}
