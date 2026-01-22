#!/bin/bash
# Install Node.js in jailshell environment (shared hosting)
# Run this in cPanel Terminal

echo "📦 Installing Node.js via nvm (works in jailshell)..."

# Install nvm in home directory
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

echo ""
echo "✅ nvm installed!"
echo ""
echo "Now run these commands:"
echo "  source ~/.bashrc"
echo "  nvm install 20"
echo "  nvm use 20"
echo "  nvm alias default 20"
echo "  node --version"
