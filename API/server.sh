#!/bin/bash

if [ -z "$1" ]; then
    echo "Error: Please provide a migration message"
    echo "Usage: ./server.sh \"your migration description\""
    exit 1
fi

alembic revision --autogenerate -m "$1"
alembic upgrade head
fastapi dev main.py