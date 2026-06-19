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
	"product-service/config"
	"product-service/routes"
)

func main() {
	// (BONUS) Env config: Memastikan .env selalu dibaca jika dijalankan di lokal tanpa docker
	_ = godotenv.Load("../.env")

	// Initialize Database
	config.ConnectDB()

	app := fiber.New()
	
	// (BONUS) Logging middleware aktif
	app.Use(logger.New())
	app.Use(recover.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Product Service is up and running!")
	})

	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	// (BONUS) Graceful Handling: Jalankan server di goroutine agar bisa menangkap sinyal OS
	go func() {
		log.Printf("Starting Product Service on port %s", port)
		if err := app.Listen(":" + port); err != nil {
			log.Panic(err)
		}
	}()

	// Menunggu sinyal interrupt/terminate dari Docker atau OS
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	log.Println("Gracefully shutting down Product Service...")
	_ = app.Shutdown()
}
