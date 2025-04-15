#!/bin/bash

# Start the backend server in the background
echo "Starting backend server..."
cd backend && ./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for the backend to initialize
sleep 2

# Start the frontend development server
echo "Starting frontend server..."
cd ..
npm run dev

# When the frontend server is stopped, also stop the backend server
kill $BACKEND_PID
