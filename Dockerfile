# Use Ubuntu as base image
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl git build-essential unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Bun (includes bunx)
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun && \
    mv /root/.bun/bin/bunx /usr/local/bin/bunx

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN ./setup.sh

# Set working dir to backend
WORKDIR /app/backend

EXPOSE 4000

# Run with Bun (instead of npm)
CMD ["bun", "start"]
