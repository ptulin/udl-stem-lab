#!/bin/bash
# Server deployment script for UDL STEM Lab
# Run this on the server after SSH'ing in

set -e  # Exit on error

echo "🚀 Starting UDL STEM Lab deployment..."

# Step 1: Check/Install Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Step 2: Check/Install PM2
echo "📦 Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
else
    echo "PM2 already installed: $(pm2 --version)"
fi

# Step 3: Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /var/www/udl-stem-lab
sudo chown $USER:$USER /var/www/udl-stem-lab

# Step 4: Clone or update repository
echo "📥 Cloning/updating repository..."
if [ -d "/var/www/udl-stem-lab/.git" ]; then
    echo "Repository exists, pulling latest..."
    cd /var/www/udl-stem-lab
    git pull origin main
else
    echo "Cloning repository..."
    cd /var/www
    git clone https://github.com/ptulin/udl-stem-lab.git
    cd udl-stem-lab
fi

# Step 5: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 6: Build application
echo "🔨 Building application..."
npm run build

# Step 7: Start/restart with PM2
echo "🚀 Starting with PM2..."
if pm2 list | grep -q "udl-stem-lab"; then
    echo "App already running, restarting..."
    pm2 restart udl-stem-lab
else
    echo "Starting new PM2 process..."
    pm2 start npm --name "udl-stem-lab" -- start
    pm2 save
fi

# Step 8: Verify
echo "✅ Verifying deployment..."
pm2 status
echo ""
echo "Testing app..."
curl -s http://localhost:3000 | head -20
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see nginx-subdomain.conf)"
echo "2. Get SSL certificate: sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com"
