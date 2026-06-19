package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/proxy"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// (BONUS) Env Config
	_ = godotenv.Load("../.env")

	app := fiber.New()

	// (BONUS) Logging middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
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

	// (BONUS) Graceful Handling: Tangkap error jika microservice down (503 Service Unavailable)
	app.All("/products", func(c *fiber.Ctx) error {
		if err := proxy.Do(c, productServiceURL+"/products"); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Product Service is currently unavailable / dead"})
		}
		c.Set("Access-Control-Allow-Origin", "*")
		return nil
	})
	app.All("/products/*", func(c *fiber.Ctx) error {
		if err := proxy.Do(c, productServiceURL+"/products/"+c.Params("*")); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Product Service is currently unavailable / dead"})
		}
		c.Set("Access-Control-Allow-Origin", "*")
		return nil
	})

	app.All("/orders", func(c *fiber.Ctx) error {
		if err := proxy.Do(c, orderServiceURL+"/orders"); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Order Service is currently unavailable / dead"})
		}
		c.Set("Access-Control-Allow-Origin", "*")
		return nil
	})
	app.All("/orders/*", func(c *fiber.Ctx) error {
		if err := proxy.Do(c, orderServiceURL+"/orders/"+c.Params("*")); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Order Service is currently unavailable / dead"})
		}
		c.Set("Access-Control-Allow-Origin", "*")
		return nil
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// (BONUS) Graceful Shutdown
	go func() {
		log.Printf("Starting API Gateway on port %s", port)
		if err := app.Listen(":" + port); err != nil {
			log.Panic(err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	log.Println("Gracefully shutting down API Gateway...")
	_ = app.Shutdown()
}
