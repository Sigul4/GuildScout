#!/bin/sh
set -e

echo "Waiting for Kafka to be ready..."
timeout=60
counter=0
step=5

until nc -z kafka 9092 || [ $counter -eq $timeout ]; do
    echo "Waiting for Kafka... ($counter/$timeout seconds)"
    sleep $step
    counter=$((counter + step))
done

if [ $counter -eq $timeout ]; then
    echo "Error: Timed out waiting for Kafka"
    exit 1
fi

echo "Kafka is ready! Starting bot..."
exec "$@"