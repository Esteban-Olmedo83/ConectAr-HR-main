#!/bin/bash

# Test Script para Logout API + Refresh-Session
# Espera que el servidor está corriendo en http://localhost:3000

set -e

BASE_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  API ENDPOINTS TEST SUITE                                 ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}\n"

# ============================================================================
# Test 1: Create Mock Session and Login
# ============================================================================

echo -e "${YELLOW}=== Test 1: Login y Crear Sesión ===${NC}"

# Este test intenta hacer login - necesitamos usuarios en BD
# Por ahora solo verificamos que el endpoint existe
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | tail -1 | cut -d':' -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

echo "Response: $RESPONSE_BODY"
echo "HTTP Status: $HTTP_STATUS"

# El login fallará porque no hay usuario, pero verificamos que el endpoint existe
if [ "$HTTP_STATUS" != "000" ]; then
  echo -e "${GREEN}✓ Login endpoint accessible${NC}"
else
  echo -e "${RED}✗ Login endpoint not accessible${NC}"
fi

# ============================================================================
# Test 2: Test Logout without Session
# ============================================================================

echo -e "\n${YELLOW}=== Test 2: Logout sin Sesión ===${NC}"

LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -c /tmp/cookies.txt)

HTTP_STATUS=$(echo "$LOGOUT_RESPONSE" | tail -1 | cut -d':' -f2)
RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | head -n -1)

echo "Response: $RESPONSE_BODY"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Logout returns 200${NC}"

  # Verificar respuesta JSON
  if echo "$RESPONSE_BODY" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Logout response has success: true${NC}"
  else
    echo -e "${RED}✗ Logout response missing success: true${NC}"
  fi

  if echo "$RESPONSE_BODY" | grep -q '"/login"'; then
    echo -e "${GREEN}✓ Logout response has redirect: /login${NC}"
  else
    echo -e "${RED}✗ Logout response missing redirect: /login${NC}"
  fi
else
  echo -e "${RED}✗ Logout returned HTTP $HTTP_STATUS (expected 200)${NC}"
fi

# ============================================================================
# Test 3: Test Refresh-Session without Session
# ============================================================================

echo -e "\n${YELLOW}=== Test 3: Refresh-Session sin Sesión ===${NC}"

REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh-session" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$REFRESH_RESPONSE" | tail -1 | cut -d':' -f2)
RESPONSE_BODY=$(echo "$REFRESH_RESPONSE" | head -n -1)

echo "Response: $RESPONSE_BODY"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Refresh-Session returns 401 without session${NC}"

  if echo "$RESPONSE_BODY" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ Refresh-Session response has success: false${NC}"
  else
    echo -e "${RED}✗ Refresh-Session response missing success: false${NC}"
  fi
else
  echo -e "${RED}✗ Refresh-Session returned HTTP $HTTP_STATUS (expected 401)${NC}"
fi

# ============================================================================
# Test 4: Test GET on Logout (should work)
# ============================================================================

echo -e "\n${YELLOW}=== Test 4: GET request en Logout ===${NC}"

LOGOUT_GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/logout" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGOUT_GET_RESPONSE" | tail -1 | cut -d':' -f2)

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ GET /api/auth/logout returns 200${NC}"
else
  echo -e "${RED}✗ GET /api/auth/logout returned HTTP $HTTP_STATUS (expected 200)${NC}"
fi

# ============================================================================
# Test 5: Test Invalid GET on Refresh-Session (should fail)
# ============================================================================

echo -e "\n${YELLOW}=== Test 5: GET request en Refresh-Session ===${NC}"

REFRESH_GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/refresh-session" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$REFRESH_GET_RESPONSE" | tail -1 | cut -d':' -f2)

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "405" ]; then
  echo -e "${GREEN}✓ GET /api/auth/refresh-session returns 405 (Method Not Allowed)${NC}"
else
  echo -e "${YELLOW}⚠ GET /api/auth/refresh-session returned HTTP $HTTP_STATUS (expected 405)${NC}"
fi

# ============================================================================
# Test 6: Test Protected Route without Session
# ============================================================================

echo -e "\n${YELLOW}=== Test 6: Acceso a ruta protegida sin sesión ===${NC}"

DASHBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -L)

HTTP_STATUS=$(echo "$DASHBOARD_RESPONSE" | tail -1 | cut -d':' -f2)
RESPONSE_BODY=$(echo "$DASHBOARD_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  # Debería redirigir a login o mostrar login page
  if echo "$RESPONSE_BODY" | grep -q "login\|Sign in\|Iniciar sesión"; then
    echo -e "${GREEN}✓ /dashboard redirects to login (contains login content)${NC}"
  else
    echo -e "${YELLOW}⚠ /dashboard returned 200 (puede ser página de login)${NC}"
  fi
else
  echo -e "${RED}✗ /dashboard returned HTTP $HTTP_STATUS${NC}"
fi

# ============================================================================
# Test 7: Test Public Route
# ============================================================================

echo -e "\n${YELLOW}=== Test 7: Acceso a ruta pública ===${NC}"

LOGIN_PAGE_RESPONSE=$(curl -s -X GET "$BASE_URL/login" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_PAGE_RESPONSE" | tail -1 | cut -d':' -f2)

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ /login is accessible${NC}"
else
  echo -e "${RED}✗ /login returned HTTP $HTTP_STATUS${NC}"
fi

echo -e "\n${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  API TESTS COMPLETED                                       ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
