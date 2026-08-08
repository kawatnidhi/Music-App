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

# Install yt-dlp globally via pip (creates /usr/local/bin/yt-dlp binary)
RUN pip3 install --no-cache-dir yt-dlp

# Create python symlink for cross-platform compatibility
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Verify yt-dlp is on PATH and accessible
RUN which yt-dlp && yt-dlp --version && echo "yt-dlp is ready"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy full repository including admin, web_app, and backend
COPY . .

# Expose backend streaming port
EXPOSE 5000

# Start production server
CMD ["node", "backend/src/server.js"]
