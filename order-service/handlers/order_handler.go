package handlers

import (
	"github.com/gofiber/fiber/v2"
	"order-service/models"
	"order-service/services"
)

type OrderHandler struct {
	service services.OrderService
}

func NewOrderHandler(service services.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var order models.Order
	if err := c.BodyParser(&order); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	err := h.service.CreateOrder(c.Context(), &order)
	if err != nil {
		if err == services.ErrProductNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err == services.ErrInsufficientStock {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

func (h *OrderHandler) GetAllOrders(c *fiber.Ctx) error {
	orders, err := h.service.GetAllOrders(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(orders)
}
