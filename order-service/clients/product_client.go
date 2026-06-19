package clients

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"order-service/models"
)

type ProductClient interface {
	GetProduct(productID string) (*models.ProductResponse, error)
	UpdateProduct(productID string, product *models.ProductResponse) error
}

type productClient struct {
	baseURL string
}

func NewProductClient() ProductClient {
	baseURL := os.Getenv("PRODUCT_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8001"
	}
	return &productClient{baseURL: baseURL}
}

func (c *productClient) GetProduct(productID string) (*models.ProductResponse, error) {
	url := fmt.Sprintf("%s/products/%s", c.baseURL, productID)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, errors.New("product not found")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get product, status: %d", resp.StatusCode)
	}

	var product models.ProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, err
	}

	return &product, nil
}

func (c *productClient) UpdateProduct(productID string, product *models.ProductResponse) error {
	url := fmt.Sprintf("%s/products/%s", c.baseURL, productID)
	body, err := json.Marshal(product)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to update product, status: %d", resp.StatusCode)
	}

	return nil
}
