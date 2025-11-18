#!/bin/bash

cd "$(dirname "$0")/.."

rm -rf build/*
mkdir -p build
javac -d build -cp src src/*.java src/com/opty/socket/tradicional/comunicado/*.java
java -cp build ClienteChat "$@"
