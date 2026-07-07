async function test() {
  const listingId = 70; // Use listing 70 created in previous test
  console.log(`Sending PUT to http://localhost:5000/api/listings/${listingId}/approve...`);
  try {
    const res = await fetch(`http://localhost:5000/api/listings/${listingId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: 'No' })
    });
    
    console.log("Response Status:", res.status);
    const data = await res.json();
    console.log("Response Data:", data);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

test();
