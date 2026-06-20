const API_BASE = 'http://localhost:5000/api/auth';

// Helper to make POST requests
async function post(endpoint, data) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return { ok: res.ok, status: res.status, json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runTests() {
  console.log("=== STARTING AUTH ENDPOINTS INTEGRATION TEST ===");

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testMobile = `+1555${Math.floor(100000 + Math.random() * 900000)}`;

  // 1. Test Register by Email
  console.log("\n1. Testing Email Registration...");
  const regRes = await post('/register', {
    email: testEmail,
    password: testPassword,
    first_name: 'John',
    last_name: 'Doe'
  });
  console.log("Status:", regRes.status);
  console.log("Response:", regRes.json);
  if (!regRes.ok) {
    console.error("❌ Email Registration failed");
  } else {
    console.log("✅ Email Registration passed");
  }

  // 2. Test Login by Email
  console.log("\n2. Testing Email Login...");
  const loginRes = await post('/login', {
    email: testEmail,
    password: testPassword
  });
  console.log("Status:", loginRes.status);
  console.log("Response:", loginRes.json);
  if (!loginRes.ok) {
    console.error("❌ Email Login failed");
  } else {
    console.log("✅ Email Login passed");
  }

  // 3. Test Mobile OTP Sending
  console.log("\n3. Testing Mobile OTP Send...");
  const sendRes = await post('/mobile/send-otp', {
    mobileNumber: testMobile
  });
  console.log("Status:", sendRes.status);
  console.log("Response:", sendRes.json);
  if (!sendRes.ok) {
    console.error("❌ Mobile OTP Send failed");
  } else {
    console.log("✅ Mobile OTP Send passed");
  }

  // 4. Test Google OAuth login mock validation
  console.log("\n4. Testing Google Auth mock validation...");
  const googleRes = await post('/google-login', {
    idToken: 'invalid_token_test'
  });
  console.log("Status (should be 400):", googleRes.status);
  console.log("Response:", googleRes.json);
  if (googleRes.status === 400) {
    console.log("✅ Google Auth rejection verified");
  } else {
    console.error("❌ Google Auth did not return expected 400 for invalid token");
  }

  console.log("\n=== AUTH ENDPOINTS TEST COMPLETE ===");
}

runTests();
