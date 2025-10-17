#!/bin/bash

function up() {
    if [ "$1" = "dev" ]; then
        docker-compose -f docker/docker-compose.yml up --build -d
    else
        echo "Error: use 'up dev'"
        exit 1
    fi
}


function down() {
  docker-compose -f docker/docker-compose.yml down
}

"$@"