FROM oven/bun:1.1
WORKDIR /app

# Install Git
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*
# # Skip copying package.json/bun.lockb since it doesn't exist yet
# COPY package.json bun.lockb* ./
# RUN bun install

# COPY . .

EXPOSE 3000

# Use bash as entrypoint so we land in a terminal
CMD ["bash"]
# CMD ["bun", "run", "dev"]
