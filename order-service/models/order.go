package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Order struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID string             `bson:"productId" json:"productId"`
	Quantity  int                `bson:"quantity" json:"quantity"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type ProductResponse struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}
