FROM golang:1.23-alpine

WORKDIR /app

# Copy go.mod and go.sum first
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build
RUN go build -o product-service .

EXPOSE 8001

CMD ["./product-service"]
