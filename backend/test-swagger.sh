#!/bin/bash

echo "Testing Lister API with Swagger..."
echo "=================================="

# Test health endpoint
echo "1. Testing health endpoint:"
curl -s http://localhost:3001/health | jq '.'
echo ""

# Test Swagger JSON
echo "2. Testing Swagger specification:"
curl -s http://localhost:3001/docs/json | jq '.info'
echo ""

echo "3. Swagger UI available at: http://localhost:3001/docs"
echo ""

# Test creating a user (should work without auth)
echo "4. Testing user creation:"
curl -s -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq '.'
echo ""

echo "5. Available endpoints in Swagger:"
curl -s http://localhost:3001/docs/json | jq '.paths | keys[]'