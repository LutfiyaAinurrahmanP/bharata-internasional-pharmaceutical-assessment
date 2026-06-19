package services

import (
	"context"
	"errors"

	"order-service/clients"
	"order-service/models"
	"order-service/repositories"
)

var (
	ErrProductNotFound   = errors.New("product not found")
	ErrInsufficientStock = errors.New("insufficient stock")
)

type OrderService interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	GetAllOrders(ctx context.Context) ([]models.Order, error)
	DeleteOrdersByProduct(ctx context.Context, productID string) error
}

type orderService struct {
	repo          repositories.OrderRepository
	productClient clients.ProductClient
}

func NewOrderService(repo repositories.OrderRepository, productClient clients.ProductClient) OrderService {
	return &orderService{
		repo:          repo,
		productClient: productClient,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, order *models.Order) error {
	if order.ProductID == "" || order.Quantity <= 0 {
		return errors.New("invalid order data")
	}

	// 1. Cek produk ada & stok cukup via Product Service
	product, err := s.productClient.GetProduct(order.ProductID)
	if err != nil {
		if err.Error() == "product not found" {
			return ErrProductNotFound
		}
		return err
	}

	// 2. Jika stok kurang
	if product.Stock < order.Quantity {
		return ErrInsufficientStock
	}

	// 3. Kurangi stok di Product Service
	product.Stock -= order.Quantity
	err = s.productClient.UpdateProduct(order.ProductID, product)
	if err != nil {
		return errors.New("failed to deduct product stock")
	}

	// 4. Simpan order ke MongoDB Order Service
	err = s.repo.Create(ctx, order)
	if err != nil {
		// (Dalam real system, di sini butuh compensating transaction untuk mengembalikan stok produk)
		return err
	}

	return nil
}

func (s *orderService) GetAllOrders(ctx context.Context) ([]models.Order, error) {
	return s.repo.FindAll(ctx)
}

func (s *orderService) DeleteOrdersByProduct(ctx context.Context, productID string) error {
	return s.repo.DeleteByProductID(ctx, productID)
}
