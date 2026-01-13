#!/bin/bash

SITE="https://kappaconnect.vercel.app"

echo "🧪 Testing WAF Protection..."
echo ""

echo "1. Testing .env access (should be 404)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/.env")
if [ "$STATUS" = "404" ]; then
  echo "   ✅ PASS - .env blocked (404)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 404)"
fi

echo ""
echo "2. Testing SQL injection (should be 403)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?id=' OR 1=1--")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - SQL injection blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
fi

echo ""
echo "3. Testing XSS (should be 403)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?name=<script>alert('XSS')</script>")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - XSS blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
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
