#!/bin/bash
# Nginx configuration script for UDL STEM Lab
# Run this on the server after the app is running

set -e

echo "🌐 Configuring Nginx for UDL STEM Lab..."

# Create nginx config for subdomain
sudo tee /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name udl-stem-lab.disruptiveexperience.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/udl-stem-lab.disruptiveexperience.com /etc/nginx/sites-enabled/

# Test nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Nginx configured!"
echo ""
echo "Next: Get SSL certificate with:"
echo "sudo certbot --nginx -d udl-stem-lab.disruptiveexperience.com"
