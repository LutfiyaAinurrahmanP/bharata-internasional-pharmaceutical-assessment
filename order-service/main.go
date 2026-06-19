package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"order-service/config"
	"order-service/routes"
)

func main() {
	// (BONUS) Env config
	_ = godotenv.Load("../.env")

	config.ConnectDB()

	app := fiber.New()
	
	// (BONUS) Logging middleware aktif
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

	// (BONUS) Graceful Handling: Jalankan server di goroutine agar bisa ditutup perlahan
	go func() {
		log.Printf("Starting Order Service on port %s", port)
		if err := app.Listen(":" + port); err != nil {
			log.Panic(err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	log.Println("Gracefully shutting down Order Service...")
	_ = app.Shutdown()
}
