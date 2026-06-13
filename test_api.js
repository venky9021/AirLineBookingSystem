const testApi = async () => {
  console.log('🚀 STARTING AEROFLOW INDIA END-TO-END REST API TESTING...');
  const baseUrl = 'http://localhost:8080/api';
  let token = '';
  let flightId = null;
  let bookingId = null;
  let pnr = '';
  
  const headers = { 'Content-Type': 'application/json' };
  const authHeaders = () => ({ ...headers, 'Authorization': `Bearer ${token}` });

  const delay = ms => new Promise(res => setTimeout(res, ms));

  console.log('⏳ Checking if Spring Boot server is alive on port 8080...');
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${baseUrl}/flights/search`);
      if (res.ok) {
        console.log('✅ Spring Boot server is UP and responding!');
        break;
      }
    } catch (e) {
      if (i === 14) {
        console.error('❌ Server is not responding. Please make sure spring-boot is running.');
        process.exit(1);
      }
      await delay(2000);
    }
  }

  try {
    // 1. User Registration
    console.log('\n--- 1. Testing User Registration ---');
    const registerEmail = `tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'API Auto Tester',
        email: registerEmail,
        password: 'password123',
        phone: '+919999900000'
      })
    });
    
    if (!regRes.ok) throw new Error(`Reg failed: ${regRes.status}`);
    const regData = await regRes.json();
    console.log('✅ Registration SUCCESS:', regData.email, `(Role: ${regData.role})`);
    token = regData.token;

    // 2. Profile Retrieval
    console.log('\n--- 2. Testing Profile Retrieval (/api/auth/me) ---');
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: authHeaders() });
    if (!meRes.ok) throw new Error(`Me failed: ${meRes.status}`);
    const meData = await meRes.json();
    console.log('✅ Profile Check SUCCESS: Verified User name is:', meData.name);

    // 3. Domestic Indian Flight Search
    console.log('\n--- 3. Testing Indian Flight Search ---');
    const searchRes = await fetch(`${baseUrl}/flights/search?origin=Delhi (DEL)&destination=Mumbai (BOM)&date=2026-06-01`, {
      headers
    });
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`);
    const flights = await searchRes.json();
    console.log('✅ Flight Search SUCCESS: Found domestic flights:', flights.length);
    if (flights.length > 0) {
      flightId = flights[0].id;
      console.log(`👉 Selected flight ID ${flightId} (${flights[0].flightNumber})`);
    } else {
      throw new Error('Seed data missing or query misaligned.');
    }

    // 4. Seating Layout Map
    console.log('\n--- 4. Testing Cabin Seat Map Fetch ---');
    const seatRes = await fetch(`${baseUrl}/flights/${flightId}`, { headers });
    if (!seatRes.ok) throw new Error(`Seat fetch failed: ${seatRes.status}`);
    const seatData = await seatRes.json();
    console.log('✅ Seat Map SUCCESS: Recieved seats count:', seatData.seats.length);
    
    const availableSeat = seatData.seats.find(s => s.isAvailable && s.seatClass === 'ECONOMY');
    if (!availableSeat) throw new Error('No Economy seat available on seeded flight.');
    console.log(`👉 Selected available seat for booking: ${availableSeat.seatNumber}`);

    // 5. Create Booking (INR values)
    console.log('\n--- 5. Testing Ticket Booking Generation ---');
    const bookRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        flightId,
        travelClass: 'ECONOMY',
        passengers: [{
          firstName: 'Rajesh',
          lastName: 'Kumar',
          passportNumber: 'Z9876543',
          dob: '1995-08-15',
          nationality: 'India',
          seatNumber: availableSeat.seatNumber
        }]
      })
    });
    
    if (!bookRes.ok) {
      const err = await bookRes.json();
      throw new Error(`Booking failed: ${JSON.stringify(err)}`);
    }
    const bookData = await bookRes.json();
    bookingId = bookData.id;
    pnr = bookData.pnr;
    console.log(`✅ Booking Created SUCCESS: ID: ${bookingId}, PNR: ${pnr}, Status: ${bookData.status}, Price: ₹${bookData.totalPrice}`);

    // 6. Confirm Payment (INR domestic conv fee calculations)
    console.log('\n--- 6. Testing Payment Confirmation ---');
    const payRes = await fetch(`${baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        bookingId,
        method: 'CARD',
        gatewayTxnId: `TXN-TEST-${Date.now()}`,
        amount: bookData.totalPrice
      })
    });
    if (!payRes.ok) throw new Error(`Payment failed: ${payRes.status}`);
    const payData = await payRes.json();
    console.log(`✅ Payment SUCCESS: Booking PNR ${payData.pnr} status is now: ${payData.status}`);

    // 7. Performing Online Check-In
    console.log('\n--- 7. Testing Online Check-In ---');
    const checkinRes = await fetch(`${baseUrl}/checkin/${pnr}?lastName=Kumar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!checkinRes.ok) throw new Error(`Checkin failed: ${checkinRes.status}`);
    const checkinData = await checkinRes.json();
    console.log(`✅ Check-In SUCCESS: Boarding status: ${checkinData.booking.status}`);
    console.log(`👉 Verified Passenger Seat on Boarding Card: ${checkinData.passengers[0].seatNumber}`);

    // 8. Admin Analytics
    console.log('\n--- 8. Testing Admin Dashboard Analytical Telemetry ---');
    let adminToken = '';
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'admin@aeroflow.com',
        password: 'password123'
      })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      adminToken = loginData.token;
      console.log('✅ Admin Login SUCCESS: Logged in using seeded credentials.');
    } else {
      console.log('⚠️ Admin Login failed. Attempting Admin registration...');
      const adminRegRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'System Administrator',
          email: 'admin@aeroflow.com',
          password: 'password123',
          phone: '+919999999999'
        })
      });
      if (!adminRegRes.ok) throw new Error(`Admin Reg failed: ${adminRegRes.status}`);
      const adminReg = await adminRegRes.json();
      adminToken = adminReg.token;
      console.log('✅ Admin Registration SUCCESS.');
    }
    token = adminToken; // Swap token to Admin

    const analRes = await fetch(`${baseUrl}/admin/analytics`, { headers: authHeaders() });
    if (!analRes.ok) throw new Error(`Analytics failed: ${analRes.status}`);
    const analData = await analRes.json();
    console.log('✅ Admin Analytics SUCCESS!');
    console.log('📊 Active Telemetry Breakdown:');
    console.log(`   - Total Revenue: ₹${analData.totalRevenue}`);
    console.log(`   - Total Bookings count: ${analData.totalBookings}`);
    console.log(`   - Registered Accounts: ${analData.totalUsers}`);
    console.log(`   - Seat occupancy share:`, analData.classOccupancy);

    console.log('\n🌟🌟 ALL END-TO-END REST API TESTS PASSED SUCCESSFULLY! NO ERRORS OCCURRED. 🌟🌟');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED WITH AN ERROR:');
    console.error(err);
    process.exit(1);
  }
};

testApi();
