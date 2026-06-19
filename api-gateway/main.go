package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/proxy"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	app := fiber.New()

	// Middlewares
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Mengizinkan frontend (port 3000) mengakses gateway
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	productServiceURL := os.Getenv("PRODUCT_SERVICE_URL")
	if productServiceURL == "" {
		productServiceURL = "http://product-service:8001"
	}

	orderServiceURL := os.Getenv("ORDER_SERVICE_URL")
	if orderServiceURL == "" {
		orderServiceURL = "http://order-service:8002"
	}

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("API Gateway is up and running!")
	})

	// Forward /products/* ke Product Service
	app.All("/products", func(c *fiber.Ctx) error {
		return proxy.Do(c, productServiceURL+"/products")
	})
	app.All("/products/*", func(c *fiber.Ctx) error {
		return proxy.Do(c, productServiceURL+"/products/"+c.Params("*"))
	})

	// Forward /orders/* ke Order Service
	app.All("/orders", func(c *fiber.Ctx) error {
		return proxy.Do(c, orderServiceURL+"/orders")
	})
	app.All("/orders/*", func(c *fiber.Ctx) error {
		return proxy.Do(c, orderServiceURL+"/orders/"+c.Params("*"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Starting API Gateway on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
