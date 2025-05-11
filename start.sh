#!/bin/bash -ex

# Exit immediately if a command fails
set -ex

sudo apt update

# Install prerequisites
sudo apt install -y curl

# Download and run NodeSource setup script for Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

echo "/home/$(whoami)";

cd "/home/ubuntu"

# Define your repo URL (replace with actual)
REPO_URL="https://github.com/rahkds/cloud-node-test.git"

# Extract folder name from the repo URL
REPO_NAME=$(basename "$REPO_URL" .git)

# Clone the repository
echo "Cloning repository from $REPO_URL..."
git clone "$REPO_URL"

# Navigate into the cloned directory
cd "$REPO_NAME"

# Install dependencies
echo "Running npm install..."
npm install

# Start the server
echo "Starting Node.js server..."
node index.js