const API_BASE = 'http://localhost:5000/api/auth';

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

async function runMobileTest() {
  console.log("=== STARTING MOBILE OTP VERIFY & COMPLETE TEST ===");

  const mobileNumber = '+1555179493';
  const otpCode = '246769';

  // 1. Verify OTP
  console.log("\n1. Testing Mobile OTP Verification...");
  const verifyRes = await post('/mobile/verify-otp', {
    mobileNumber,
    otpCode
  });
  console.log("Status:", verifyRes.status);
  console.log("Response:", verifyRes.json);

  if (!verifyRes.ok) {
    console.error("❌ Mobile OTP Verification failed");
    return;
  }
  console.log("✅ Mobile OTP Verification passed");

  // 2. Complete mobile registration
  console.log("\n2. Testing Mobile Complete Registration...");
  const completeRes = await post('/mobile/complete-register', {
    mobileNumber,
    first_name: 'Jane',
    last_name: 'Smith'
  });
  console.log("Status:", completeRes.status);
  console.log("Response:", completeRes.json);

  if (!completeRes.ok) {
    console.error("❌ Mobile Registration Completion failed");
    return;
  }
  console.log("✅ Mobile Registration Completion passed");

  console.log("\n=== MOBILE OTP TEST COMPLETE ===");
}

runMobileTest();
