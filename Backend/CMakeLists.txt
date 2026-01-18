cmake_minimum_required(VERSION 3.10)
project(triage_backend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Threads REQUIRED)
find_package(ZLIB REQUIRED)
find_package(CURL REQUIRED)

# Include directories for Crow and ASIO
include_directories(${CMAKE_SOURCE_DIR})
include_directories(${CMAKE_SOURCE_DIR}/crow)
include_directories(${CMAKE_SOURCE_DIR}/asio)

# Define ASIO standalone (not using Boost.Asio)
add_definitions(-DASIO_STANDALONE)

# Source files
add_executable(server main.cpp)

# Link pthread, zlib, and curl
target_link_libraries(server Threads::Threads ZLIB::ZLIB CURL::libcurl)

# Copy sample_data.txt to build directory for runtime
configure_file(${CMAKE_SOURCE_DIR}/sample_data.txt ${CMAKE_BINARY_DIR}/sample_data.txt COPYONLY)
