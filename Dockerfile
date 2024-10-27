# Use official PHP image for Laravel
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    npm \
    nodejs \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:2.7.9 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install

# Install Node.js dependencies for React
RUN npm install

# Expose Laravel port
EXPOSE 8000

# Expose React port
EXPOSE 5173

# Create Supervisor configuration for both Laravel and React
RUN echo '[supervisord]\nnodaemon=true\n' > /etc/supervisord.conf && \
    echo '[program:laravel]\ncommand=php artisan serve --host=0.0.0.0 --port=8000\ndirectory=/var/www\nautostart=true\nautorestart=true\n' >> /etc/supervisord.conf && \
    echo '[program:react]\ncommand=npm run dev --prefix /var/www\ndirectory=/var/www\nautostart=true\nautorestart=true\n' >> /etc/supervisord.conf

# Start Supervisor to run both Laravel and React with hot-reload
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
