#!/bin/bash

SITE="https://kappaconnect.vercel.app"

echo "🧪 Testing WAF Protection..."
echo ""

echo "1. Testing .env access (should be 404 or 307)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/.env")
if [ "$STATUS" = "404" ] || [ "$STATUS" = "307" ]; then
  echo "   ✅ PASS - .env blocked ($STATUS) - Note: 307 is from vercel.json redirect"
else
  echo "   ❌ FAIL - Got $STATUS (expected 404 or 307)"
fi

echo ""
echo "2. Testing SQL injection (should be 403)..."
# URL encode the SQL injection
SQL_INJECTION="%27%20OR%201%3D1--"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?id=$SQL_INJECTION")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - SQL injection blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
  echo "   Try manually: curl -v \"$SITE/?id=%27%20OR%201%3D1--\""
fi

echo ""
echo "3. Testing XSS (should be 403)..."
# URL encode the XSS
XSS_PAYLOAD="%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?name=$XSS_PAYLOAD")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - XSS blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
  echo "   Try manually: curl -v \"$SITE/?name=$XSS_PAYLOAD\""
fi

echo ""
echo "4. Testing normal page (should be 200)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/")
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PASS - Normal page works (200)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 200)"
fi

echo ""
echo "✅ WAF Test Complete!"
