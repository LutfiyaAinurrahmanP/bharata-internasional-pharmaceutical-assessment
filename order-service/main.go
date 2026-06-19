package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"order-service/config"
	"order-service/routes"
)

func main() {
	config.ConnectDB()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(recover.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Order Service is up and running!")
	})

	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}

	log.Printf("Starting Order Service on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
