#!/bin/bash

# Exit on first error
set -e
echo "🚀 Starting MeraDhan deployment..."

# Navigate to main project directory
cd MeradhanProject/

# --------------------------
# LINT & TYPE CHECK ALL
# --------------------------
echo "🧹 Running lint and type checks for all projects..."
./lint-check-all.sh
./setup.sh

echo "✅ Setup complete."

# --------------------------
# BACKEND
# --------------------------
echo "🧩 Checking backend..."
cd backend
npm run lint
npm run check
echo "✅ Backend check complete."

# Restart backend and worker
echo "♻️ Restarting Backend & Worker..."
pm2 restart MeraDhan-Backend
pm2 restart MeraDhan-Worker


# --------------------------
# FRONTEND: CLIENT
# --------------------------
echo "🧩 Building Client frontend..."
cd ../frontend/meradhan/
npm run lint
npm run check
npm run build
echo "✅ Client build complete."

# Restart only Client
echo "♻️ Restarting Client app..."
pm2 restart MeraDhan-Client

# --------------------------
# FRONTEND: CRM
# --------------------------
echo "🧩 Building CRM frontend..."
cd ../crm/
npm run lint
npm run check
npm run build
echo "✅ CRM build complete."

# Restart only CRM
echo "♻️ Restarting CRM app..."
pm2 restart MeraDhan-CRM


# --------------------------
# SAVE STATE
# --------------------------
pm2 save

echo "✅ Deployment finished successfully!"
