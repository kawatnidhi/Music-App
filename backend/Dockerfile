# Dockerfile for Render Deployment
# Includes Node.js 20, Python 3, and yt-dlp for pure ad-free YouTube audio stream extraction

FROM node:20-bullseye-slim

# Install Python 3, pip, and FFmpeg for audio processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally via pip
RUN pip3 install --no-cache-dir yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code and assets
COPY . .

# Expose backend streaming port
EXPOSE 5000

# Start production server
CMD ["node", "src/server.js"]
