FROM php:8.2-fpm-bullseye as base

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
RUN export COMPOSER_VERSION=2.3.10 \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=${COMPOSER_VERSION}

# Development stage
FROM base as dev

CMD ["php-fpm"]

# Production stage
FROM base as prod

# Copy application files
COPY . .

# Install dependencies (skip scripts to avoid .env dependency)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set proper permissions
RUN chown -R www-data:www-data var/ \
    && chmod -R 755 var/

# Clear cache
RUN php bin/console cache:clear --env=prod

CMD ["php-fpm"]
