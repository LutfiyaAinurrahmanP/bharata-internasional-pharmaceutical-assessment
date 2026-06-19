package services

import (
	"context"
	"errors"
	"net/http"
	"time"

	"product-service/models"
	"product-service/repositories"
)

type ProductService interface {
	CreateProduct(ctx context.Context, product *models.Product) error
	GetAllProducts(ctx context.Context) ([]models.Product, error)
	GetProductByID(ctx context.Context, id string) (*models.Product, error)
	UpdateProduct(ctx context.Context, id string, product *models.Product) error
	DeleteProduct(ctx context.Context, id string) error
}

type productService struct {
	repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) CreateProduct(ctx context.Context, product *models.Product) error {
	if product.Name == "" || product.Price < 0 || product.Stock < 0 {
		return errors.New("invalid product data")
	}
	return s.repo.Create(ctx, product)
}

func (s *productService) GetAllProducts(ctx context.Context) ([]models.Product, error) {
	return s.repo.FindAll(ctx)
}

func (s *productService) GetProductByID(ctx context.Context, id string) (*models.Product, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *productService) UpdateProduct(ctx context.Context, id string, product *models.Product) error {
	if product.Name == "" || product.Price < 0 || product.Stock < 0 {
		return errors.New("invalid product data")
	}
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return errors.New("product not found")
	}
	return s.repo.Update(ctx, id, product)
}

func (s *productService) DeleteProduct(ctx context.Context, id string) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return errors.New("product not found")
	}
	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	// Cascade delete orders via HTTP request to order-service
	req, err := http.NewRequestWithContext(ctx, "DELETE", "http://order-service:8002/orders/product/"+id, nil)
	if err == nil {
		client := &http.Client{Timeout: 5 * time.Second}
		client.Do(req)
	}

	return nil
}
