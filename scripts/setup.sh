#!/bin/bash

echo "Setting up Airline Ops Platform..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Start Docker services
echo "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Generate Prisma client
echo "Generating Prisma client..."
cd packages/database-schemas
npx prisma generate
npx prisma db push
npx prisma db seed

# Build shared packages
echo "Building shared packages..."
cd ../..
npm run build

echo "Setup complete! You can now run 'npm run dev' to start the services."
