package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"product-service/config"
	"product-service/routes"
)

func main() {
	// Initialize Database
	config.ConnectDB()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(recover.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Product Service is up and running!")
	})

	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	log.Printf("Starting Product Service on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
