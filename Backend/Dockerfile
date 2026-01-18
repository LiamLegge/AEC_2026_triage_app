# ===========================
# STAGE 1: Build the Binary
# ===========================
FROM ubuntu:22.04 AS builder

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    zlib1g-dev \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all source files (main.cpp, headers, crow/, asio/, etc.)
COPY main.cpp CMakeLists.txt circularQueue.h patientClass.h ./
COPY crow/ ./crow/
COPY asio/ ./asio/
COPY asio.hpp ./
COPY sample_data.txt ./

# Build the application
RUN mkdir build && cd build \
    && cmake .. \
    && make -j$(nproc)

# ===========================
# STAGE 2: Run the Binary
# ===========================
FROM ubuntu:22.04

# Install only minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    zlib1g \
    libcurl4 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/build/server .

# Copy sample data for the application
COPY sample_data.txt ./

# Cloud Run defaults to 8080, but we read from PORT env variable
ENV PORT=8080

# Email configuration (set these via Cloud Run environment variables)
# GMAIL_USER=jackchambers5uni@gmail.com
# GMAIL_APP_PASSWORD=your-16-char-app-password

# Expose the port (informational)
EXPOSE 8080

# Run the server
CMD ["./server"]
