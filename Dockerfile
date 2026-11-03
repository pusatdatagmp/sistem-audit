FROM php:8.3-fpm-alpine

ARG HOST_UID=1000
ARG HOST_GID=1000

RUN apk add --no-cache \
        bash \
        git \
        curl \
        shadow \
        libzip \
        icu-libs \
        libpng \
        libjpeg-turbo \
        libwebp \
        freetype \
        oniguruma \
    && apk add --no-cache --virtual .build-deps \
        libzip-dev \
        icu-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache \
    && apk del .build-deps

# Samakan uid/gid www-data dengan user VPS supaya file di bind mount
# (storage/, bootstrap/cache, vendor/) dimiliki user host, bukan root.
RUN groupmod -o -g "${HOST_GID}" www-data \
    && usermod -o -u "${HOST_UID}" -g "${HOST_GID}" www-data

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini

ENV COMPOSER_HOME=/tmp/composer

WORKDIR /var/www/html

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
