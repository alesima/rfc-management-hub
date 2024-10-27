# Define the app service name used in docker-compose.yml
APP_SERVICE = app

# Default target: Show help menu
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build              Build Docker containers."
	@echo "  make up                 Build and start Docker containers in detached mode."
	@echo "  make down               Stop and remove Docker containers."
	@echo "  make restart            Restart Docker containers."
	@echo "  make logs               Show real-time logs for the app service."
	@echo "  make artisan cmd=<cmd>  Run a Laravel Artisan command inside the app container. Example: make artisan cmd=migrate"
	@echo "  make composer-install   Install Composer dependencies inside the container."
	@echo "  make npm-install        Install Node.js dependencies for React inside the container."
	@echo "  make migrate            Run Laravel migrations to set up the database."
	@echo "  make test               Run Laravel tests inside the container."
	@echo "  make shell              Open a shell inside the app container."

# Build Docker containers
build:
	docker build --progress=plain --no-cache -t rfc_management:latest .

# Build and start Docker containers in detached mode
up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Containers started. Backend on http://localhost:8000 and frontend on http://localhost:3000"

# Stop and remove all running containers
down:
	@echo "Stopping and removing Docker containers..."
	docker-compose down
	@echo "Containers stopped and removed."

# Restart Docker containers by calling down and up
restart: down up

# Show the real-time logs for the app service
logs:
	@echo "Showing logs for app service..."
	docker-compose logs -f $(APP_SERVICE)

# Run a Laravel Artisan command inside the app container
# - Usage: make artisan cmd=migrate
artisan:
	@echo "Running Artisan command: $(cmd)..."
	docker-compose exec $(APP_SERVICE) php artisan $(cmd)

# Install PHP Composer dependencies inside the container
composer-install:
	@echo "Installing Composer dependencies..."
	docker-compose exec $(APP_SERVICE) composer install

# Install Node.js dependencies for React frontend
npm-install:
	@echo "Installing Node.js dependencies..."
	docker-compose exec $(APP_SERVICE) npm install

# Run Laravel migrations to set up the database
migrate:
	@echo "Running Laravel migrations..."
	docker-compose exec $(APP_SERVICE) php artisan migrate

# Run Laravel tests inside the Docker container
test:
	@echo "Running Laravel tests..."
	docker-compose exec $(APP_SERVICE) php artisan test

# Open a shell inside the app container
shell:
	@echo "Opening shell in app container..."
	docker-compose exec $(APP_SERVICE) sh
