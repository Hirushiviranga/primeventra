const payload = {
  type: 'Apartment',
  title: 'Test Draft Apartment',
  description: 'Beautiful luxury test apartment',
  price: '15000000',
  district: 'Colombo',
  city: 'Colombo 03',
  photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
  status: 'Draft',
  submittedBy: 'aaa',
  email: 'aaa@gmail.com',
  phone: '+94 771234567',
  whatsapp: '+94 771234567',
  negotiable: 'Yes',
  agreeToTerms: true,
  apartmentComplex: 'Twin Peaks',
  completionStatus: 'Ready',
  furnishedStatus: 'Fully Furnished',
  floorNumber: '15',
  totalFloors: '30',
  parking: '1 Slot',
  amenities: 'Pool, Gym, Security',
  bedrooms: 3,
  bathrooms: 2,
  apartmentSize: 1200
};

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log("Response Status:", res.status);
    const data = await res.json();
    console.log("Response Data:", data);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

test();
