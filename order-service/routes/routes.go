package routes

import (
	"github.com/gofiber/fiber/v2"
	"order-service/clients"
	"order-service/handlers"
	"order-service/repositories"
	"order-service/services"
)

func SetupRoutes(app *fiber.App) {
	repo := repositories.NewOrderRepository()
	productClient := clients.NewProductClient()
	service := services.NewOrderService(repo, productClient)
	handler := handlers.NewOrderHandler(service)

	api := app.Group("/orders")
	api.Post("/", handler.CreateOrder)
	api.Get("/", handler.GetAllOrders)
}
