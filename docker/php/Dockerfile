# ---- Stage 1: frontend build ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: PHP dependencies ----
FROM composer:2 AS composer_deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# ---- Stage 3: runtime ----
FROM php:8.2-fpm-alpine AS runtime

RUN apk add --no-cache \
    nginx supervisor \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev icu-dev oniguruma-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install pdo_mysql gd zip intl mbstring bcmath opcache

WORKDIR /var/www/html

COPY --from=composer_deps /app/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/local/php.ini /usr/local/etc/php/conf.d/zz-custom.ini

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD php-fpm -D && nginx -g 'daemon off;'
