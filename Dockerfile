FROM php:8-apache AS base
# Only files inside the public directory should be available from outside.
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
 # These settings do not prevent development but are quite useful for production.
 && echo "ServerTokens Prod" >> /etc/apache2/apache2.conf \
 && mv "${PHP_INI_DIR}/php.ini-production" "${PHP_INI_DIR}/php.ini" \
 && docker-php-ext-enable opcache
# Add the complete PHP sources.
ADD ./src /var/www/html/src

# Install composer with optimized autoloading. This also needs the src from above to register the apps classes.
FROM base AS vendor
RUN apt-get update && apt-get install -y git zip unzip
COPY --from=composer:latest /usr/bin/composer /usr/bin/
ADD ./composer.* /var/www/html/
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --classmap-authoritative

# Build and minify all public files. This needs the vendor styles and js from composer.
FROM node AS build
ADD ./build /build
WORKDIR /build
RUN npm ci
ADD ./public /public
COPY --from=vendor /var/www/html/public/vendor /public/vendor
RUN node build.js

# Create the final image.
FROM base
# Also use the default configuration. This already uses getenv to be compatible with docker.
ADD ./config/config.local.php.dist /var/www/html/config/config.local.php
# Copy the composer vendor files. The styles and js moved to public are not needed.
COPY --from=vendor /var/www/html/vendor /var/www/html/vendor
# Copy the complete public directory from the build script. More assets can be added here directly from public.
COPY --from=build /build/dist /var/www/html/public
