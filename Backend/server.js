require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize the express application
const app = express();

// Define the port (uses environment variable if available, otherwise defaults to 5000)
const PORT = process.env.PORT || 5000;

// Enable CORS explicitly for standard React/Vite development ports
// NOTE: Once you deploy your frontend, add your new frontend Vercel URL to this array!
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
 
}));

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
  console.error('CRITICAL: Supabase URL and Anon Key or Service Role Key must be configured in environment variables.');
}

// Use Service Role Key if available (to bypass RLS for administrative actions), otherwise fall back to Anon Key
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// GET root
app.get('/', (req, res) => {
  res.send('PrimeVentra Express backend is running.');
});

// GET status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API is healthy and database client is initialized.' 
  });
});

// GET /api/listings - Retrieve listings
app.get('/api/listings', async (req, res) => {
  try {
    let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
    
    // Add optional filters
    if (req.query.type) {
      query = query.eq('type', req.query.type);
    }
    if (req.query.district) {
      query = query.eq('district', req.query.district);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// POST /api/listings - Submit a new listing
app.post('/api/listings', async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      price,
      district,
      city,
      photos,
      firstName,
      lastName,
      phone,
      whatsapp,
      email,
      negotiable,
      agreeToTerms
    } = req.body;

    // Validate required fields
    if (!type || !title || !price || !district || !city) {
      return res.status(400).json({ error: 'Missing required listing fields: type, title, price, district, or city.' });
    }

    // Build description string including form metadata not present in database columns
    let fullDescription = description || '';
    const details = [];
    
    if (firstName || lastName) {
      details.push(`Contact Person: ${[firstName, lastName].filter(Boolean).join(' ')}`);
    }
    if (phone) details.push(`Phone: ${phone}`);
    if (whatsapp) details.push(`WhatsApp: ${whatsapp}`);
    if (email) details.push(`Email: ${email}`);
    if (negotiable) details.push(`Negotiable: ${negotiable}`);
    details.push(`Status: Pending`);

    // Type-specific metadata serialization
    if (type === 'Apartment') {
      if (req.body.apartmentComplex) details.push(`Apartment Complex: ${req.body.apartmentComplex}`);
      if (req.body.completionStatus) details.push(`Completion Status: ${req.body.completionStatus}`);
      if (req.body.furnishedStatus) details.push(`Furnished Status: ${req.body.furnishedStatus}`);
      if (req.body.floorNumber) details.push(`Floor Number: ${req.body.floorNumber}`);
      if (req.body.totalFloors) details.push(`Total Floors in Building: ${req.body.totalFloors}`);
      if (req.body.parking) details.push(`Parking: ${req.body.parking}`);
      if (req.body.amenities) details.push(`Amenities: ${req.body.amenities}`);
    } else if (type === 'House') {
      if (req.body.landSize && req.body.landUnit) {
        details.push(`Land Area: ${req.body.landSize} ${req.body.landUnit}`);
      }
      if (req.body.completionStatus) details.push(`Completion Status: ${req.body.completionStatus}`);
      if (req.body.furnishedStatus) details.push(`Furnished Status: ${req.body.furnishedStatus}`);
    } else if (type === 'Land') {
      if (req.body.landSize && req.body.landUnit) {
        details.push(`Land Area: ${req.body.landSize} ${req.body.landUnit}`);
      }
    }

    if (details.length > 0) {
      fullDescription += `\n\n--- Property & Contact Details ---\n` + details.join('\n');
    }

    // Map fields to DB schema
    const payload = {
      type,
      title,
      description: fullDescription,
      price: Number(price),
      district,
      city,
      photos: photos || []
    };

    if (type === 'House') {
      payload.bedrooms = req.body.bedrooms ? parseInt(req.body.bedrooms) || null : null;
      payload.bathrooms = req.body.bathrooms ? parseInt(req.body.bathrooms) || null : null;
      payload.size_sqft = req.body.houseSize ? parseInt(req.body.houseSize) || null : null;

      let landPerches = req.body.landSize ? parseFloat(req.body.landSize) || null : null;
      if (landPerches && req.body.landUnit && req.body.landUnit.toLowerCase().includes('acre')) {
        landPerches = landPerches * 160; // Convert Acres to Perches
      }
      payload.land_size_perches = landPerches;
    } else if (type === 'Land') {
      let landPerches = req.body.landSize ? parseFloat(req.body.landSize) || null : null;
      if (landPerches && req.body.landUnit && req.body.landUnit.toLowerCase().includes('acre')) {
        landPerches = landPerches * 160;
      }
      payload.land_size_perches = landPerches;
      payload.land_type = req.body.landType || null;
    } else if (type === 'Apartment') {
      payload.bedrooms = req.body.bedrooms || null;
      payload.bathrooms = req.body.bathrooms ? parseInt(req.body.bathrooms) || null : null;
      payload.size_sqft = req.body.apartmentSize ? parseInt(req.body.apartmentSize) || null : null;
    }

    // Insert into Supabase table 'listings'
    const { data, error } = await supabase
      .from('listings')
      .insert([payload])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, message: 'Listing submitted successfully!', data });
  } catch (error) {
    console.error('Error submitting listing:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// PUT /api/listings/:id/approve - Approve a listing
app.put('/api/listings/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch current listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('description')
      .eq('id', id)
      .single();
      
    if (fetchError || !listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    
    // 2. Update status in description from Pending to Approved
    let desc = listing.description || '';
    if (desc.includes('Status: Pending')) {
      desc = desc.replace('Status: Pending', 'Status: Approved');
    } else if (!desc.includes('Status: Approved')) {
      desc += '\nStatus: Approved';
    }
    
    // 3. Save updated description
    const { data, error: updateError } = await supabase
      .from('listings')
      .update({ description: desc })
      .eq('id', id)
      .select();
      
    if (updateError) {
      throw updateError;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: `Listing with ID ${id} not found or update not permitted.` });
    }
    
    res.json({ success: true, message: 'Listing approved successfully!', data });
  } catch (error) {
    console.error('Error approving listing:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// PUT /api/listings/:id - Update a listing
app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      description,
      price,
      district,
      city,
      photos,
      status, // 'Pending' or 'Approved'
      featured, // 'Yes' or 'No'
      owner,
      phone,
      whatsapp,
      email,
      negotiable,
      mapLink,
      
      // type-specific
      apartmentComplex,
      completionStatus,
      furnishedStatus,
      floorNumber,
      totalFloors,
      parking,
      amenities,
      landSize,
      landUnit,
      landType,
      bedrooms,
      bathrooms,
      houseSize,
      apartmentSize
    } = req.body;

    // Build description string including form metadata
    let fullDescription = description || '';
    const separator = '\n\n--- Property & Contact Details ---';
    if (fullDescription.includes(separator)) {
      fullDescription = fullDescription.split(separator)[0];
    }

    const details = [];
    if (owner) details.push(`Contact Person: ${owner}`);
    if (phone) details.push(`Phone: ${phone}`);
    if (whatsapp) details.push(`WhatsApp: ${whatsapp}`);
    if (email) details.push(`Email: ${email}`);
    if (negotiable) details.push(`Negotiable: ${negotiable}`);
    if (mapLink) details.push(`Google Map Link: ${mapLink}`);
    details.push(`Status: ${status || 'Approved'}`);
    details.push(`Featured: ${featured || 'No'}`);

    if (type === 'Apartment') {
      if (apartmentComplex) details.push(`Apartment Complex: ${apartmentComplex}`);
      if (completionStatus) details.push(`Completion Status: ${completionStatus}`);
      if (furnishedStatus) details.push(`Furnished Status: ${furnishedStatus}`);
      if (floorNumber) details.push(`Floor Number: ${floorNumber}`);
      if (totalFloors) details.push(`Total Floors in Building: ${totalFloors}`);
      if (parking) details.push(`Parking: ${parking}`);
      if (amenities) details.push(`Amenities: ${amenities}`);
    } else if (type === 'House') {
      if (landSize && landUnit) {
        details.push(`Land Area: ${landSize} ${landUnit}`);
      }
      if (completionStatus) details.push(`Completion Status: ${completionStatus}`);
      if (furnishedStatus) details.push(`Furnished Status: ${furnishedStatus}`);
    } else if (type === 'Land') {
      if (landSize && landUnit) {
        details.push(`Land Area: ${landSize} ${landUnit}`);
      }
    }

    if (details.length > 0) {
      fullDescription += separator + '\n' + details.join('\n');
    }

    // Map fields to DB schema
    const payload = {
      type,
      title,
      description: fullDescription,
      price: Number(price),
      district,
      city,
      photos: photos || []
    };

    if (type === 'House') {
      payload.bedrooms = bedrooms ? parseInt(bedrooms) || null : null;
      payload.bathrooms = bathrooms ? parseInt(bathrooms) || null : null;
      payload.size_sqft = houseSize ? parseInt(houseSize) || null : null;

      let landPerches = landSize ? parseFloat(landSize) || null : null;
      if (landPerches && landUnit && landUnit.toLowerCase().includes('acre')) {
        landPerches = landPerches * 160; // Convert Acres to Perches
      }
      payload.land_size_perches = landPerches;
    } else if (type === 'Land') {
      let landPerches = landSize ? parseFloat(landSize) || null : null;
      if (landPerches && landUnit && landUnit.toLowerCase().includes('acre')) {
        landPerches = landPerches * 160;
      }
      payload.land_size_perches = landPerches;
      payload.land_type = landType || null;
    } else if (type === 'Apartment') {
      payload.bedrooms = bedrooms || null;
      payload.bathrooms = bathrooms ? parseInt(bathrooms) || null : null;
      payload.size_sqft = apartmentSize ? parseInt(apartmentSize) || null : null;
    }

    const { data, error } = await supabase
      .from('listings')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `Listing with ID ${id} not found or update not permitted.` });
    }

    res.json({ success: true, message: 'Listing updated successfully!', data });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// DELETE /api/listings/:id - Reject / Delete a listing
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: `Listing with ID ${id} not found or deletion not permitted.` });
    }
    
    res.json({ success: true, message: 'Listing deleted/rejected successfully!' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// POST /api/contact - Handle contact inquiries
app.post('/api/contact', (req, res) => {
  console.log('Received contact message:', req.body);
  res.json({
    success: true,
    message: 'Thank you for your message. We will contact you shortly.'
  });
});

// Start the server locally (if not in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is actively listening on http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;