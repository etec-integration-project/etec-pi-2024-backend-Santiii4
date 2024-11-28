#!/bin/sh

echo "Waiting for the database to be ready..."
until nc -z database 3306; do
  sleep 2
  echo "Still waiting for the database..."
done

echo "Database is ready. Starting the backend..."
exec "$@"
