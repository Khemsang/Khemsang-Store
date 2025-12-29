import fetch from 'node-fetch';

async function testCustomerRegistrationAndLogin() {
  try {
    console.log("👤 Testing Customer Registration...");
    
    // Test customer registration
    const regResponse = await fetch('http://localhost:4002/api/auth/register/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: 'testpassword123'
      })
    });

    const regData = await regResponse.json();
    console.log("📊 Registration Response:", regResponse.status);
    console.log("📋 Registration Data:", JSON.stringify(regData, null, 2));
    
    if (regData.success) {
      console.log("✅ Customer registration successful!");
      
      // Now test login (should require OTP)
      console.log("\n🔐 Testing Customer Login (should require OTP)...");
      
      const loginResponse = await fetch('http://localhost:4002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testcustomer@example.com',
          password: 'testpassword123'
        })
      });

      const loginData = await loginResponse.json();
      console.log("📊 Login Response:", loginResponse.status);
      console.log("📋 Login Data:", JSON.stringify(loginData, null, 2));
      
      if (loginData.needsOTP) {
        console.log("✅ Customer login correctly requires OTP!");
      } else {
        console.log("❌ Unexpected: Customer should need OTP");
      }
    } else {
      console.log("❌ Registration failed:", regData.message);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCustomerRegistrationAndLogin();