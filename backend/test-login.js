import fetch from 'node-fetch';

async function testSuperAdminLogin() {
  try {
    console.log("🔐 Testing Super Admin Login...");
    
    const response = await fetch('http://localhost:4002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'khemsangrai@gmail.com',
        password: 'superadmin123'
      })
    });

    const data = await response.json();
    
    console.log("📊 Response Status:", response.status);
    console.log("📋 Response Data:", JSON.stringify(data, null, 2));
    
    if (data.message === "Super Admin login successful" && !data.needsOTP) {
      console.log("✅ Super Admin login successful - No OTP required!");
      console.log("🎯 Redirect to:", data.redirectTo);
    } else if (data.needsOTP) {
      console.log("❌ Unexpected: Super Admin should not need OTP");
    } else {
      console.log("❌ Login failed:", data.message);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testSuperAdminLogin();