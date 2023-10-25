cmake_minimum_required(VERSION 3.0)
project(MultiBackend)

set(CMAKE_C_COMPILER clang)
set(CMAKE_C_OUTPUT_EXTENSION .wasm)
set(CMAKE_CXX_OUTPUT_EXTENSION .wasm)

set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

include(CheckTypeSize)
check_type_size(int SIZEOF_INT)
if(SIZEOF_INT EQUAL 4)
    set(MB_INT_IS_64 1)
else()
    message(FATAL_ERROR "int is not 32 bits")
endif()

add_library(mb.wasm OBJECT mb.c)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --target=wasm32 -nostdlib -nostdinc ")

configure_file(config.h.in config.h)
