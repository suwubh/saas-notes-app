#!/bin/bash

API_URL="http://localhost:3001"
echo "🧪 Testing SaaS Notes API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on error helper
check_success() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Test failed! Exiting...${NC}"
    exit 1
  fi
}

check_token() {
  if [ -z "$1" ] || [ "$1" == "null" ]; then
    echo -e "${RED}❌ Login failed, no token returned!${NC}"
    exit 1
  fi
}

# -------------------------
# Test health endpoint
# -------------------------
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
curl -s "$API_URL/health"
check_success

# -------------------------
# Test login for all accounts
# -------------------------
echo -e "\n${YELLOW}Testing login for all test accounts...${NC}"

# Acme Admin
echo -e "\n${GREEN}Testing Acme Admin login...${NC}"
ACME_ADMIN_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@acme.test", "password": "password"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
check_token "$ACME_ADMIN_TOKEN"
echo "Acme Admin Token: ${ACME_ADMIN_TOKEN:0:50}..."

# Acme Member
echo -e "\n${GREEN}Testing Acme Member login...${NC}"
ACME_USER_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@acme.test", "password": "password"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
check_token "$ACME_USER_TOKEN"

# Globex Admin
echo -e "\n${GREEN}Testing Globex Admin login...${NC}"
GLOBEX_ADMIN_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@globex.test", "password": "password"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
check_token "$GLOBEX_ADMIN_TOKEN"

# Globex Member
echo -e "\n${GREEN}Testing Globex Member login...${NC}"
GLOBEX_USER_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@globex.test", "password": "password"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
check_token "$GLOBEX_USER_TOKEN"

# -------------------------
# Test notes creation and limits
# -------------------------
echo -e "\n${YELLOW}Testing notes creation and subscription limits...${NC}"

# Create 3 notes for Acme (should work)
for i in {1..3}; do
  echo "Creating Acme note $i..."
  curl -s -X POST "$API_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACME_USER_TOKEN" \
    -d "{\"title\": \"Acme Note $i\", \"content\": \"Content for note $i\"}"
  echo ""
done

# Try to create 4th note (should fail)
echo -e "\n${RED}Testing subscription limit (should fail)...${NC}"
LIMIT_TEST=$(curl -s -X POST "$API_URL/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACME_USER_TOKEN" \
  -d '{"title": "4th Note", "content": "This should fail"}')

if [[ "$LIMIT_TEST" == *"error"* ]]; then
  echo -e "${GREEN}✅ Subscription limit correctly enforced${NC}"
else
  echo -e "${RED}❌ Subscription limit test FAILED${NC}"
  exit 1
fi

# -------------------------
# Test tenant isolation
# -------------------------
echo -e "\n${YELLOW}Testing tenant isolation...${NC}"

echo "Getting Acme notes..."
ACME_NOTES=$(curl -s -X GET "$API_URL/notes" \
  -H "Authorization: Bearer $ACME_USER_TOKEN")
echo "$ACME_NOTES"

echo "Getting Globex notes (should be 0)..."
GLOBEX_NOTES=$(curl -s -X GET "$API_URL/notes" \
  -H "Authorization: Bearer $GLOBEX_USER_TOKEN")
echo "$GLOBEX_NOTES"

if [[ "$GLOBEX_NOTES" == *"count\":0"* ]]; then
  echo -e "${GREEN}✅ Tenant isolation works${NC}"
else
  echo -e "${RED}❌ Tenant isolation failed${NC}"
  exit 1
fi

# -------------------------
# Test upgrade functionality
# -------------------------
echo -e "\n${YELLOW}Testing subscription upgrade...${NC}"
UPGRADE=$(curl -s -X POST "$API_URL/tenants/acme/upgrade" \
  -H "Authorization: Bearer $ACME_ADMIN_TOKEN")
echo "$UPGRADE"

if [[ "$UPGRADE" == *"upgraded"* ]]; then
  echo -e "${GREEN}✅ Upgrade successful${NC}"
else
  echo -e "${RED}❌ Upgrade failed${NC}"
  exit 1
fi

# -------------------------
# Test creating more notes after upgrade
# -------------------------
echo -e "\n${GREEN}Testing unlimited notes after upgrade...${NC}"
curl -s -X POST "$API_URL/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACME_USER_TOKEN" \
  -d '{"title": "Post-upgrade note", "content": "This should work now"}'
check_success

# -------------------------
# Done
# -------------------------
echo -e "\n${GREEN}✅ All API tests passed!${NC}"
exit 0
