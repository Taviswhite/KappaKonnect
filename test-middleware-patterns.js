// Quick test to verify threat patterns work
const THREAT_PATTERNS = {
  sqlInjection: [
    /('|%27)\s*or\s*1\s*=\s*1/i,
    /(--|#|\/\*)/i,
    /\bunion\b.*\bselect\b/i,
    /\bselect\b.*\bfrom\b/i,
  ],
  xss: [
    /<script.*?>.*?<\/script>/i,
    /<script/i,
    /javascript:/i,
    /alert\s*\(/i,
  ],
};

function detectThreat(value, patterns) {
  try {
    const decoded = decodeURIComponent(value);
    return patterns.some((pattern) => pattern.test(decoded) || pattern.test(value));
  } catch {
    return patterns.some((pattern) => pattern.test(value));
  }
}

// Test cases
const tests = [
  {
    name: "SQL Injection (URL encoded)",
    input: "id=%27%20OR%201%3D1--",
    expected: true,
  },
  {
    name: "SQL Injection (decoded)",
    input: "id=' OR 1=1--",
    expected: true,
  },
  {
    name: "XSS (URL encoded)",
    input: "name=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E",
    expected: true,
  },
  {
    name: "XSS (decoded)",
    input: "name=<script>alert('XSS')</script>",
    expected: true,
  },
  {
    name: "Normal query",
    input: "id=123&name=test",
    expected: false,
  },
];

console.log("Testing threat detection patterns...\n");

tests.forEach((test) => {
  const hasSQL = detectThreat(test.input, THREAT_PATTERNS.sqlInjection);
  const hasXSS = detectThreat(test.input, THREAT_PATTERNS.xss);
  const detected = hasSQL || hasXSS;
  const passed = detected === test.expected;
  
  console.log(`${passed ? "✅" : "❌"} ${test.name}`);
  console.log(`   Input: ${test.input.substring(0, 50)}`);
  console.log(`   Expected: ${test.expected}, Got: ${detected}`);
  if (!passed) {
    console.log(`   SQL detected: ${hasSQL}, XSS detected: ${hasXSS}`);
  }
  console.log("");
});
