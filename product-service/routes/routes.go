package routes

import (
	"github.com/gofiber/fiber/v2"
	"product-service/handlers"
	"product-service/repositories"
	"product-service/services"
)

func SetupRoutes(app *fiber.App) {
	repo := repositories.NewProductRepository()
	service := services.NewProductService(repo)
	handler := handlers.NewProductHandler(service)

	api := app.Group("/products")
	api.Post("/", handler.CreateProduct)
	api.Get("/", handler.GetAllProducts)
	api.Get("/:id", handler.GetProductByID)
	api.Put("/:id", handler.UpdateProduct)
	api.Delete("/:id", handler.DeleteProduct)
}
