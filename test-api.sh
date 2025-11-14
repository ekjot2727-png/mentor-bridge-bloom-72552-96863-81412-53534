#!/bin/bash

# Mentor Bridge Bloom - Comprehensive API Test Script
# Tests all endpoints and features

BASE_URL="http://localhost:3000/api"
STUDENT_EMAIL="student@mentorbridge.com"
STUDENT_PASSWORD="student@123"
ADMIN_EMAIL="admin@mentorbridge.com"
ADMIN_PASSWORD="admin@123"
ALUMNI_EMAIL="alumni@mentorbridge.com"
ALUMNI_PASSWORD="alumni@123"

STUDENT_TOKEN=""
ADMIN_TOKEN=""
ALUMNI_TOKEN=""

echo "================================"
echo "Mentor Bridge Bloom API Tests"
echo "================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to make API calls and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -n "Testing: $description... "
    
    if [ -z "$token" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "error\|Error\|401\|404"; then
        echo -e "${RED}FAILED${NC}"
        echo "Response: $response"
        ((TESTS_FAILED++))
        return 1
    else
        echo -e "${GREEN}PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    fi
}

# === AUTH TESTS ===
echo "=== AUTHENTICATION TESTS ==="

# Test 1: Student Login
echo -n "Testing: Student Login... "
STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

if echo "$STUDENT_RESPONSE" | grep -q "accessToken"; then
    STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $STUDENT_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 2: Admin Login
echo -n "Testing: Admin Login... "
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$ADMIN_RESPONSE" | grep -q "accessToken"; then
    ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $ADMIN_RESPONSE"
    ((TESTS_FAILED++))
fi

# Test 3: Alumni Login
echo -n "Testing: Alumni Login... "
ALUMNI_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ALUMNI_EMAIL\",\"password\":\"$ALUMNI_PASSWORD\"}")

if echo "$ALUMNI_RESPONSE" | grep -q "accessToken"; then
    ALUMNI_TOKEN=$(echo "$ALUMNI_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $ALUMNI_RESPONSE"
    ((TESTS_FAILED++))
fi

echo ""
echo "=== PROFILE TESTS ==="

# Test 4: Get Student Profile
test_endpoint "GET" "/profiles/me" "" "$STUDENT_TOKEN" "Get Student Profile"

# Test 5: Get Admin Profile  
test_endpoint "GET" "/profiles/me" "" "$ADMIN_TOKEN" "Get Admin Profile"

# Test 6: Get Alumni Profile
test_endpoint "GET" "/profiles/me" "" "$ALUMNI_TOKEN" "Get Alumni Profile"

echo ""
echo "=== MESSAGE TESTS ==="

# Test 7: Get Student Messages
test_endpoint "GET" "/messages" "" "$STUDENT_TOKEN" "Get Student Messages"

# Test 8: Get Alumni Messages
test_endpoint "GET" "/messages" "" "$ALUMNI_TOKEN" "Get Alumni Messages"

echo ""
echo "=== CONNECTION TESTS ==="

# Test 9: Get Student Connections
test_endpoint "GET" "/connections" "" "$STUDENT_TOKEN" "Get Student Connections"

# Test 10: Get Alumni Connections
test_endpoint "GET" "/connections" "" "$ALUMNI_TOKEN" "Get Alumni Connections"

echo ""
echo "=== ANALYTICS TESTS (Admin Only) ==="

# Test 11: Get User Statistics
test_endpoint "GET" "/analytics/users" "" "$ADMIN_TOKEN" "Get User Statistics"

# Test 12: Get Engagement Metrics
test_endpoint "GET" "/analytics/engagement" "" "$ADMIN_TOKEN" "Get Engagement Metrics"

# Test 13: Get Platform Health
test_endpoint "GET" "/analytics/platform-health" "" "$ADMIN_TOKEN" "Get Platform Health"

# Test 14: Get Dashboard Summary
test_endpoint "GET" "/analytics/dashboard-summary" "" "$ADMIN_TOKEN" "Get Dashboard Summary"

echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
