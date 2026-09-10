# ---- Stage 1: frontend build ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: PHP dependencies ----
# Run composer under the SAME PHP version as the runtime stage (8.4) so the
# generated vendor/composer/platform_check.php asserts a version the runtime
# satisfies, and so composer resolves/verifies against the real target platform.
# (composer.lock pins symfony/string, symfony/translation, symfony/clock, etc.
# at 8.0.x, which require php >= 8.4 — building on an older PHP would fail the
# platform check at install time and fatally at runtime.)
FROM php:8.4-cli-alpine AS composer_deps

RUN apk add --no-cache git unzip libzip-dev icu-dev \
  && docker-php-ext-install zip intl \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# ---- Stage 3: runtime ----
FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache \
    nginx supervisor \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev icu-dev oniguruma-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install pdo_mysql gd zip intl mbstring bcmath opcache

WORKDIR /var/www/html

COPY . .
COPY --from=composer_deps /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/local/php.ini /usr/local/etc/php/conf.d/zz-custom.ini
COPY docker/supervisord.conf /etc/supervisord.conf

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
