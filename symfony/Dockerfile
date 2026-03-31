FROM php:8.2-fpm-bookworm as base

WORKDIR /var/www/html/symfony

RUN apt update \
    && apt install -y \
        zip \
        unzip \
        git \
        libpq-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        sqlite3 \
        libsqlite3-dev \
    && apt clean -y && apt autoremove -y

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql gd

# Configure PHP upload limits
RUN echo "upload_max_filesize = 10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_file_uploads = 20" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Development stage
FROM base as dev

CMD ["php-fpm"]

# Production stage
FROM base as prod

# Copy application files
COPY . .

# Install dependencies (skip scripts to avoid .env dependency)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear cache then set proper permissions
RUN php bin/console cache:clear --env=prod \
    && chown -R www-data:www-data var/ \
    && chmod -R 755 var/

CMD ["php-fpm"]
