require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Initialize the express application
const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

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

// Local file fallback helper functions for payments
const getPaymentsFromLocalFile = () => {
  const filePath = path.join(__dirname, 'payments.json');
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error("Failed to parse local payments file:", err);
    }
  }
  return [];
};

const writePaymentToLocalFile = (listing, submittedBy, email, paymentMethod, paymentStatus, transactionId = null, packagePrice = null, packageName = null) => {
  const filePath = path.join(__dirname, 'payments.json');
  let payments = getPaymentsFromLocalFile();
  const paymentRecord = {
    id: transactionId || `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    listing_id: listing.id,
    listing_title: listing.title,
    listing_price: listing.price,
    listing_type: listing.type,
    username: submittedBy || 'Guest',
    email: email || '',
    payment_method: paymentMethod || 'Bank Transfer',
    payment_status: paymentStatus || 'Pending',
    package_name: packageName || null,
    package_price: packagePrice || null,
    created_at: new Date().toISOString()
  };
  payments.push(paymentRecord);
  try {
    fs.writeFileSync(filePath, JSON.stringify(payments, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write local payments file:", err);
  }
  return paymentRecord;
};

const updatePaymentInLocalFile = (listingId, newStatus) => {
  const filePath = path.join(__dirname, 'payments.json');
  let payments = getPaymentsFromLocalFile();
  const idx = payments.findIndex(p => p.listing_id == listingId || p.id == listingId);
  if (idx !== -1) {
    payments[idx].payment_status = newStatus;
    try {
      fs.writeFileSync(filePath, JSON.stringify(payments, null, 2), 'utf8');
      return payments[idx];
    } catch (err) {
      console.error("Failed to update local payments file:", err);
    }
  }
  return null;
};

const updatePaymentListingIdInLocalFile = (oldListingId, newListingId) => {
  const filePath = path.join(__dirname, 'payments.json');
  let payments = getPaymentsFromLocalFile();
  let updated = false;
  payments = payments.map(p => {
    if (p.listing_id == oldListingId) {
      updated = true;
      return { ...p, listing_id: newListingId };
    }
    return p;
  });
  if (updated) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(payments, null, 2), 'utf8');
    } catch (err) {
      console.error("Failed to update local payments file listing ID:", err);
    }
  }
};

const updateListingDescriptionInSupabase = async (listingId, newStatus) => {
  try {
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('description')
      .eq('id', listingId)
      .single();
      
    if (fetchError || !listing) return;
    
    let desc = listing.description || '';
    if (newStatus === 'Completed') {
      if (desc.includes('Payment Status: Pending')) {
        desc = desc.replace('Payment Status: Pending', 'Payment Status: Completed');
      } else if (!desc.includes('Payment Status: Completed')) {
        desc += '\nPayment Status: Completed';
      }
    } else {
      if (desc.includes('Payment Status: Completed')) {
        desc = desc.replace('Payment Status: Completed', 'Payment Status: Pending');
      } else if (!desc.includes('Payment Status: Pending')) {
        desc += '\nPayment Status: Pending';
      }
    }
    
    await supabase.from('listings').update({ description: desc }).eq('id', listingId);
  } catch (err) {
    console.error("Failed to update listing description during local payment fallback:", err);
  }
};


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
      agreeToTerms,
      submittedBy,
      paymentMethod,
      paymentStatus,
      transactionId,
      packagePrice,
      packageName
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
    if (submittedBy) details.push(`Submitted By: ${submittedBy}`);
    if (paymentMethod) details.push(`Payment Method: ${paymentMethod}`);
    if (paymentStatus) details.push(`Payment Status: ${paymentStatus}`);
    if (transactionId) details.push(`Transaction ID: ${transactionId}`);
    if (packageName) details.push(`Package Chosen: ${packageName}`);
    if (packagePrice) details.push(`Listing Fee: LKR ${packagePrice}`);
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

    if (data && data.length > 0) {
      const listing = data[0];
      try {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            listing_id: listing.id,
            listing_title: listing.title,
            listing_price: listing.price,
            listing_type: listing.type,
            username: submittedBy || 'Guest',
            email: email || '',
            payment_method: paymentMethod || 'Bank Transfer',
            payment_status: paymentStatus || 'Pending'
          }]);
        
        if (paymentError) {
          console.warn("Failed to insert payment in Supabase (falling back to local file):", paymentError.message);
          writePaymentToLocalFile(listing, submittedBy, email, paymentMethod, paymentStatus, transactionId, packagePrice, packageName);
        }
      } catch (err) {
        console.warn("Failed to save payment in Supabase (falling back to local file):", err.message);
        writePaymentToLocalFile(listing, submittedBy, email, paymentMethod, paymentStatus, transactionId, packagePrice, packageName);
      }
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
    const { featured } = req.body; // 'Yes' or 'No'
    
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
    
    // 3. Update featured status in description
    const featuredStatus = featured || 'No';
    if (desc.includes('Featured: Yes')) {
      desc = desc.replace('Featured: Yes', `Featured: ${featuredStatus}`);
    } else if (desc.includes('Featured: No')) {
      desc = desc.replace('Featured: No', `Featured: ${featuredStatus}`);
    } else {
      desc += `\nFeatured: ${featuredStatus}`;
    }
    
    // 4. Save updated description
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
      submittedBy,
      paymentMethod,
      paymentStatus,
      
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

    // Fetch existing listing to preserve Submitted By if not explicitly changed
    let preservedSubmittedBy = null;
    let preservedPaymentMethod = null;
    let preservedPaymentStatus = null;
    try {
      const { data: existingListing } = await supabase
        .from('listings')
        .select('description')
        .eq('id', id)
        .maybeSingle();
      if (existingListing && existingListing.description) {
        const match = existingListing.description.match(/Submitted By:\s*(.+)/);
        if (match) {
          preservedSubmittedBy = match[1].trim();
        }
        const matchMethod = existingListing.description.match(/Payment Method:\s*(.+)/);
        if (matchMethod) {
          preservedPaymentMethod = matchMethod[1].trim();
        }
        const matchStatus = existingListing.description.match(/Payment Status:\s*(.+)/);
        if (matchStatus) {
          preservedPaymentStatus = matchStatus[1].trim();
        }
      }
    } catch (e) {
      console.warn("Failed to fetch existing listing for preservation:", e);
    }

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
    
    const finalSubmittedBy = submittedBy || preservedSubmittedBy;
    if (finalSubmittedBy) details.push(`Submitted By: ${finalSubmittedBy}`);

    const finalPaymentMethod = paymentMethod || preservedPaymentMethod;
    if (finalPaymentMethod) details.push(`Payment Method: ${finalPaymentMethod}`);

    const finalPaymentStatus = paymentStatus || preservedPaymentStatus;
    if (finalPaymentStatus) details.push(`Payment Status: ${finalPaymentStatus}`);

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

// GET /api/enquiries - Retrieve all contact inquiries from Supabase
app.get('/api/enquiries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map database fields to front-end expected fields
    const formatted = data.map(item => {
      // If date is stored as ISO string, format it for display
      const displayDate = item.created_at
        ? new Date(item.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        : 'Unknown';

      return {
        id: item.id,
        client: item.name || 'Anonymous',
        interest: item.subject || 'Property Inquiry',
        contact: `${item.email || ''}${item.phone ? ' / ' + item.phone : ''}`,
        message: item.message || '',
        msg: item.message || '', // Map to both message and msg for compatibility
        status: item.status,
        statusText: item.status_text, // Map status_text from DB to statusText for Frontend
        date: displayDate
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching enquiries from database:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// POST /api/contact - Handle contact inquiries and save to Supabase
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, subject, message.' });
    }

    const payload = {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'new-badge',
      status_text: 'New' // Use status_text in DB
    };

    const { data, error } = await supabase
      .from('enquiries')
      .insert([payload])
      .select();

    if (error) {
      throw error;
    }

    console.log('Saved contact message to database:', data);
    res.json({
      success: true,
      message: 'Thank you for your message. We will contact you shortly.',
      data: data ? data[0] : null
    });
  } catch (error) {
    console.error('Error saving contact message to database:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// PUT /api/enquiries/:id/reply - Update enquiry status in database
app.put('/api/enquiries/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('enquiries')
      .update({
        status: 'reserved',
        status_text: 'Contacted' // Use status_text in DB
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `Enquiry with ID ${id} not found.` });
    }

    res.json({ success: true, message: 'Enquiry status updated successfully!', data: data[0] });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// POST /api/listings/:id/reject - Reject a listing and save to rejected_properties
app.post('/api/listings/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    // 1. Fetch the original listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !listing) {
      return res.status(404).json({ error: `Listing with ID ${id} not found.` });
    }

    // 2. Insert into rejected_properties
    const rejectedPayload = {
      original_id: listing.id,
      type: listing.type,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      district: listing.district,
      city: listing.city,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      size_sqft: listing.size_sqft,
      land_size_perches: listing.land_size_perches,
      land_type: listing.land_type,
      photos: listing.photos,
      rejection_reason: reason,
      created_at: listing.created_at
    };

    const { error: insertError } = await supabase
      .from('rejected_properties')
      .insert([rejectedPayload]);

    if (insertError) {
      throw insertError;
    }

    // 3. Delete from listings
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ success: true, message: 'Property listing rejected and moved to rejected properties database.' });
  } catch (error) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// GET /api/rejected-properties - Retrieve all rejected properties
app.get('/api/rejected-properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rejected_properties')
      .select('*')
      .neq('rejection_reason', 'Sold Property')
      .order('rejected_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching rejected properties:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// PUT /api/listings/:id/sold - Toggle listing status between Sold (archive) and Approved (restore)
app.put('/api/listings/:id/sold', async (req, res) => {
  try {
    const { id } = req.params;
    const { isSold } = req.body;

    if (isSold) {
      // 1. Fetch the original listing
      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !listing) {
        return res.status(404).json({ error: 'Listing not found in database.' });
      }

      let desc = listing.description || '';
      if (desc.includes('Status: Approved')) {
        desc = desc.replace('Status: Approved', 'Status: Sold');
      } else if (desc.includes('Status: Pending')) {
        desc = desc.replace('Status: Pending', 'Status: Sold');
      } else if (!desc.includes('Status: Sold')) {
        desc += '\nStatus: Sold';
      }

      // 2. Insert into rejected_properties with rejection_reason = 'Sold Property'
      const rejectedPayload = {
        original_id: listing.id,
        type: listing.type,
        title: listing.title,
        description: desc,
        price: listing.price,
        district: listing.district,
        city: listing.city,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        size_sqft: listing.size_sqft,
        land_size_perches: listing.land_size_perches,
        land_type: listing.land_type,
        photos: listing.photos,
        rejection_reason: 'Sold Property',
        created_at: listing.created_at
      };

      const { error: insertError } = await supabase
        .from('rejected_properties')
        .insert([rejectedPayload]);

      if (insertError) {
        throw insertError;
      }

      // 3. Delete from listings (which might trigger cascade if fkey exists)
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      res.json({ success: true, message: 'Property marked as Sold, archived in rejected properties, and removed from active listings.' });
    } else {
      // Restore property back to active listings
      // 1. Try to find the sold property in rejected_properties
      const { data: soldProperty, error: fetchSoldError } = await supabase
        .from('rejected_properties')
        .select('*')
        .or(`id.eq.${id},original_id.eq.${id}`)
        .eq('rejection_reason', 'Sold Property')
        .maybeSingle();

      if (!soldProperty) {
        // Fallback: check if it still exists in listings (backward compatibility)
        const { data: listing, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (listing) {
          let desc = listing.description || '';
          if (desc.includes('Status: Sold')) {
            desc = desc.replace('Status: Sold', 'Status: Approved');
          } else if (!desc.includes('Status: Approved')) {
            desc += '\nStatus: Approved';
          }
          const { data: updatedData } = await supabase
            .from('listings')
            .update({ description: desc })
            .eq('id', id)
            .select();
          return res.json({ success: true, message: 'Status reverted to Approved in active listings.', data: updatedData });
        }
        return res.status(404).json({ error: 'Property not found in listings or sold archives.' });
      }

      let desc = soldProperty.description || '';
      if (desc.includes('Status: Sold')) {
        desc = desc.replace('Status: Sold', 'Status: Approved');
      } else if (!desc.includes('Status: Approved')) {
        desc += '\nStatus: Approved';
      }

      // 2. Insert back into listings (this will generate a new auto-incremented id)
      const restorePayload = {
        type: soldProperty.type,
        title: soldProperty.title,
        description: desc,
        price: soldProperty.price,
        district: soldProperty.district,
        city: soldProperty.city,
        bedrooms: soldProperty.bedrooms,
        bathrooms: soldProperty.bathrooms,
        size_sqft: soldProperty.size_sqft,
        land_size_perches: soldProperty.land_size_perches,
        land_type: soldProperty.land_type,
        photos: soldProperty.photos,
        created_at: soldProperty.created_at
      };

      const { data: restoredListing, error: restoreError } = await supabase
        .from('listings')
        .insert([restorePayload])
        .select();

      if (restoreError || !restoredListing || restoredListing.length === 0) {
        throw restoreError || new Error('Failed to restore listing');
      }

      const newListingId = restoredListing[0].id;
      const originalId = soldProperty.original_id;

      // 3. Update listing_id in payments table (for both cloud database & local fallback)
      if (originalId) {
        await supabase
          .from('payments')
          .update({ listing_id: newListingId })
          .eq('listing_id', originalId);

        // Local file fallback helper update
        updatePaymentListingIdInLocalFile(originalId, newListingId);
      }

      // 4. Delete from rejected_properties
      await supabase
        .from('rejected_properties')
        .delete()
        .eq('id', soldProperty.id);

      res.json({ success: true, message: 'Property restored back to active listings successfully!', data: restoredListing });
    }
  } catch (error) {
    console.error('Error updating listing status to sold:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// GET /api/sold-properties - Retrieve all sold properties
app.get('/api/sold-properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rejected_properties')
      .select('*')
      .eq('rejection_reason', 'Sold Property')
      .order('rejected_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching sold properties:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});


// Local file fallbacks for user mobile numbers and OTP verification
const USER_MOBILES_FILE = path.join(__dirname, 'portal_users_mobiles.json');
const OTP_FILE = path.join(__dirname, 'otp_verifications.json');

function readUserMobiles() {
  if (!fs.existsSync(USER_MOBILES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USER_MOBILES_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

function writeUserMobile(username, mobile) {
  try {
    const mobiles = readUserMobiles();
    mobiles[username] = mobile;
    fs.writeFileSync(USER_MOBILES_FILE, JSON.stringify(mobiles, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing user mobile:', e);
  }
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  let trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  let cleaned = trimmed.replace(/\D/g, '');
  // Sri Lanka local mobile number (e.g., 0768330194 -> +94768330194)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+94' + cleaned.substring(1);
  }
  return '+' + cleaned;
}

async function generateUniqueUsername(baseUsername) {
  let uniqueUsername = baseUsername;
  let exists = true;
  let counter = 1;

  while (exists) {
    const { data, error } = await supabase
      .from('portal_users')
      .select('id')
      .eq('username', uniqueUsername)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      exists = false;
    } else {
      uniqueUsername = `${baseUsername}${counter}`;
      counter++;
    }
  }
  return uniqueUsername;
}

function readLocalOTPs() {
  if (!fs.existsSync(OTP_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(OTP_FILE, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
}

function writeLocalOTPs(otps) {
  try {
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing local OTPs:', e);
  }
}

// POST /api/auth/register - Register a new portal user using Email & Password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, mobile } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields: email and password.' });
    }

    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('portal_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if username already exists
    const derivedUsername = email.split('@')[0];
    const { data: existingUsernameUser, error: usernameCheckError } = await supabase
      .from('portal_users')
      .select('id')
      .eq('username', derivedUsername)
      .maybeSingle();

    if (usernameCheckError) throw usernameCheckError;
    if (existingUsernameUser) {
      return res.status(400).json({ error: 'This username (email prefix) is already taken. Please use a different email.' });
    }

    // Check if mobile number is already registered (if provided)
    let formattedMobile = null;
    if (mobile) {
      formattedMobile = formatPhoneNumber(mobile);
      const { data: existingMobileUser, error: mobileCheckError } = await supabase
        .from('portal_users')
        .select('id')
        .eq('mobile', formattedMobile)
        .maybeSingle();

      if (mobileCheckError) throw mobileCheckError;

      if (existingMobileUser) {
        return res.status(400).json({ error: 'Mobile number is already registered.' });
      }
    }

    // 2. Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // 3. Insert new user
    let insertData = { 
      username: email.split('@')[0],
      email, 
      password_hash: passwordHash,
      first_name: first_name || null,
      last_name: last_name || null,
      auth_provider: 'local'
    };
    if (formattedMobile) {
      insertData.mobile = formattedMobile;
    }

    const { data, error: insertError } = await supabase
      .from('portal_users')
      .insert([insertData])
      .select('id, email, mobile, first_name, last_name, auth_provider, created_at')
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, message: 'User registered successfully!', user: data });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: `Registration error: ${error.message}` });
  }
});

// POST /api/auth/login - Log in an existing portal user using Email & Password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields: email and password.' });
    }

    // 1. Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // 2. Query matching user
    const { data: user, error: loginError } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (loginError) throw loginError;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ success: true, message: 'Logged in successfully!', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: `Login error: ${error.message}` });
  }
});

// POST /api/auth/google-login - Login or register a user using Google OAuth
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID Token is required.' });
    }

    // 1. Decode ID Token locally
    const tokenParts = idToken.split('.');
    if (tokenParts.length < 2) {
      return res.status(400).json({ error: 'Invalid Google ID Token.' });
    }
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));
    const { sub: googleUserId, email, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google account.' });
    }

    // 2. Check if user already exists
    let { data: user, error: checkError } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!user) {
      // 3. User does not exist, register them
      const uniqueUsername = await generateUniqueUsername(email.split('@')[0]);
      const insertData = {
        username: uniqueUsername,
        email,
        first_name: given_name || '',
        last_name: family_name || '',
        auth_provider: 'google',
        provider_id: googleUserId
      };

      const { data: newUser, error: insertError } = await supabase
        .from('portal_users')
        .insert([insertData])
        .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
        .single();

      if (insertError) throw insertError;
      user = newUser;
    } else {
      // User exists. Update their provider details if not set to Google
      if (user.auth_provider !== 'google' || !user.provider_id) {
        await supabase
          .from('portal_users')
          .update({ auth_provider: 'google', provider_id: googleUserId })
          .eq('id', user.id);
        user.auth_provider = 'google';
      }
    }

    res.json({ success: true, message: 'Logged in with Google successfully!', user });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ error: `Google Auth error: ${error.message}` });
  }
});

// POST /api/auth/google-callback - Exchange OAuth authorization code for token and authenticate user
app.post('/api/auth/google-callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Auth code is required.' });
    }
    if (!redirectUri) {
      return res.status(400).json({ error: 'redirectUri is required.' });
    }

    // 1. Exchange auth code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Google token exchange error:', tokens);
      return res.status(400).json({ error: tokens.error_description || 'Failed to exchange Google auth code.' });
    }

    const { id_token: idToken } = tokens;
    if (!idToken) {
      return res.status(400).json({ error: 'No ID token returned by Google.' });
    }

    // 2. Decode ID Token locally
    const tokenParts = idToken.split('.');
    if (tokenParts.length < 2) {
      return res.status(400).json({ error: 'Invalid Google ID Token.' });
    }
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));
    const { sub: googleUserId, email, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google account.' });
    }

    // 3. Check if user already exists
    let { data: user, error: checkError } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!user) {
      // 4. User does not exist, register them
      const uniqueUsername = await generateUniqueUsername(email.split('@')[0]);
      const insertData = {
        username: uniqueUsername,
        email,
        first_name: given_name || '',
        last_name: family_name || '',
        auth_provider: 'google',
        provider_id: googleUserId
      };

      const { data: newUser, error: insertError } = await supabase
        .from('portal_users')
        .insert([insertData])
        .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
        .single();

      if (insertError) throw insertError;
      user = newUser;
    } else {
      // User exists. Update their provider details if not set to Google
      if (user.auth_provider !== 'google' || !user.provider_id) {
        await supabase
          .from('portal_users')
          .update({ auth_provider: 'google', provider_id: googleUserId })
          .eq('id', user.id);
        user.auth_provider = 'google';
      }
    }

    res.json({ success: true, message: 'Logged in with Google successfully!', user });
  } catch (error) {
    console.error('Error during Google callback:', error);
    res.status(500).json({ error: `Google Auth error: ${error.message}` });
  }
});

// POST /api/auth/mobile/send-otp - Generate & send OTP for mobile signup/login
app.post('/api/auth/mobile/send-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required.' });
    }

    // Generate 6-digit OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 minutes

    console.log('\n==================================================');
    console.log(`[MOBILE REGISTRATION OTP] Code sent to ${mobileNumber}: ${otpCode}`);
    console.log('==================================================\n');

    // Attempt to store in Supabase
    try {
      const { error: otpError } = await supabase
        .from('otp_verifications')
        .insert([{ mobile: mobileNumber, otp_code: otpCode, expires_at: expiresAt.toISOString(), is_verified: false }]);
      if (otpError) throw otpError;
    } catch (dbErr) {
      console.warn("Supabase otp_verifications write failed, storing in local file fallback:", dbErr.message);
      const otps = readLocalOTPs();
      otps.push({
        id: Date.now(),
        mobile: mobileNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        is_verified: false
      });
      writeLocalOTPs(otps);
    }

    // Send SMS via Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your Primeventra verification code is ${otpCode}. It expires in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formatPhoneNumber(mobileNumber)
        });
        console.log(`Successfully sent Twilio SMS to ${formatPhoneNumber(mobileNumber)}`);
      } catch (smsErr) {
        console.error("Twilio SMS send failed:", smsErr.message);
      }
    }

    res.json({ success: true, message: 'OTP verification code sent successfully.' });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// POST /api/auth/mobile/verify-otp - Verify OTP and check if user exists
app.post('/api/auth/mobile/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otpCode } = req.body;
    if (!mobileNumber || !otpCode) {
      return res.status(400).json({ error: 'Missing required fields: mobileNumber and otpCode.' });
    }

    let isValid = false;

    // Verify in Supabase
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('mobile', mobileNumber)
        .eq('otp_code', otpCode)
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const record = data[0];
        const expiry = new Date(record.expires_at);
        if (expiry > new Date()) {
          isValid = true;
          await supabase
            .from('otp_verifications')
            .update({ is_verified: true })
            .eq('id', record.id);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase verification failed, using local file fallback:", dbErr.message);
      const otps = readLocalOTPs();
      const matchIdx = otps.findIndex(o => o.mobile === mobileNumber && o.otp_code === otpCode && !o.is_verified);
      if (matchIdx !== -1) {
        const record = otps[matchIdx];
        const expiry = new Date(record.expires_at);
        if (expiry > new Date()) {
          isValid = true;
          otps[matchIdx].is_verified = true;
          writeLocalOTPs(otps);
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    // Check if user is already registered in portal_users
    const { data: user, error: checkError } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .eq('mobile', mobileNumber)
      .maybeSingle();

    if (checkError) throw checkError;

    res.json({ 
      success: true, 
      message: 'OTP verified successfully!', 
      isRegistered: !!user,
      user: user || null
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// POST /api/auth/mobile/complete-register - Create user record with first & last name
app.post('/api/auth/mobile/complete-register', async (req, res) => {
  try {
    const { mobileNumber, first_name, last_name } = req.body;
    if (!mobileNumber || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields: mobileNumber, first_name, and last_name.' });
    }

    // 1. Double check if already registered
    const { data: existingUser, error: checkError } = await supabase
      .from('portal_users')
      .select('id')
      .eq('mobile', mobileNumber)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      return res.status(400).json({ error: 'Mobile number is already registered.' });
    }

    // 2. Insert new user
    const insertData = {
      username: mobileNumber,
      mobile: mobileNumber,
      first_name,
      last_name,
      auth_provider: 'mobile'
    };

    const { data: user, error: insertError } = await supabase
      .from('portal_users')
      .insert([insertData])
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, message: 'User registered successfully!', user });
  } catch (error) {
    console.error('Error completing mobile registration:', error);
    res.status(500).json({ error: `Registration error: ${error.message}` });
  }
});

// POST /api/auth/forgot-password - Send an OTP to the user's mobile number
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    if (!email || !mobileNumber) {
      return res.status(400).json({ error: 'Missing required fields: email and mobileNumber.' });
    }

    // 1. Fetch user to verify they exist
    const { data: user, error } = await supabase
      .from('portal_users')
      .select('id, email, mobile')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({ error: 'Email address not found.' });
    }

    // 2. Validate mobile number matches
    const storedMobile = user.mobile || readUserMobiles()[email];
    // Clean spaces, dashes, country codes for flexible comparison
    const cleanInput = mobileNumber.replace(/\D/g, '');
    const cleanStored = storedMobile ? storedMobile.replace(/\D/g, '') : '';

    if (!cleanStored || (!cleanInput.endsWith(cleanStored.slice(-9)) && !cleanStored.endsWith(cleanInput.slice(-9)))) {
      return res.status(400).json({ error: 'Provided mobile number does not match registered mobile number.' });
    }

    // 3. Generate a 6-digit OTP code
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Log the OTP code prominently to terminal console for local debugging
    console.log('\n==================================================');
    console.log(`[FORGOT PASSWORD OTP] code for user '${email}': ${otpCode}`);
    console.log(`[FORGOT PASSWORD OTP] sent to mobile number: ${mobileNumber}`);
    console.log('==================================================\n');

    // 4. Store in database (with local JSON fallback)
    try {
      const { error: otpError } = await supabase
        .from('otp_verifications')
        .insert([{ username: email, mobile: mobileNumber, otp_code: otpCode, expires_at: expiresAt.toISOString(), is_verified: false }]);
      
      if (otpError) throw otpError;
    } catch (dbErr) {
      console.warn("Supabase otp_verifications write failed, storing in local file fallback:", dbErr.message);
      const otps = readLocalOTPs();
      otps.push({
        id: Date.now(),
        username: email,
        mobile: mobileNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        is_verified: false
      });
      writeLocalOTPs(otps);
    }

    // Send SMS via Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your Primeventra password reset verification code is ${otpCode}. It expires in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formatPhoneNumber(mobileNumber)
        });
        console.log(`Successfully sent Twilio password reset SMS to ${formatPhoneNumber(mobileNumber)}`);
      } catch (smsErr) {
        console.error("Twilio SMS send failed:", smsErr.message);
      }
    }

    res.json({ success: true, message: 'OTP verification code sent successfully.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// POST /api/auth/verify-otp - Verify the OTP code
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, mobileNumber, otpCode } = req.body;
    if (!email || !mobileNumber || !otpCode) {
      return res.status(400).json({ error: 'Missing required fields: email, mobileNumber, and otpCode.' });
    }

    let isValid = false;

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('username', email)
        .eq('otp_code', otpCode)
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const record = data[0];
        const expiry = new Date(record.expires_at);
        if (expiry > new Date()) {
          isValid = true;
          // Mark as verified
          await supabase
            .from('otp_verifications')
            .update({ is_verified: true })
            .eq('id', record.id);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase otp verification failed, using local file fallback:", dbErr.message);
      const otps = readLocalOTPs();
      const matchIdx = otps.findIndex(o => o.username === email && o.otp_code === otpCode && !o.is_verified);
      if (matchIdx !== -1) {
        const record = otps[matchIdx];
        const expiry = new Date(record.expires_at);
        if (expiry > new Date()) {
          isValid = true;
          otps[matchIdx].is_verified = true;
          writeLocalOTPs(otps);
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// POST /api/auth/reset-password - Reset password using verified OTP code
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otpCode, and newPassword.' });
    }

    // 1. Confirm that a verified OTP exists for this user/code combination
    let isVerified = false;

    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('username', email)
        .eq('otp_code', otpCode)
        .eq('is_verified', true);
      
      if (error) throw error;
      if (data && data.length > 0) {
        isVerified = true;
      }
    } catch (dbErr) {
      console.warn("Supabase verified OTP lookup failed, using local file fallback:", dbErr.message);
      const otps = readLocalOTPs();
      const match = otps.find(o => o.username === email && o.otp_code === otpCode && o.is_verified);
      if (match) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(400).json({ error: 'Unverified reset request. Verify OTP first.' });
    }

    // 2. Hash new password
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    // 3. Update the user password in Supabase
    const { error: updateError } = await supabase
      .from('portal_users')
      .update({ password_hash: passwordHash })
      .eq('email', email);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});


// GET /api/payments - Retrieve all transaction records from Supabase (with Local File Fallback)
app.get('/api/payments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase payments table query failed, returning local file database:", error.message);
      const localPayments = getPaymentsFromLocalFile();
      return res.json(localPayments);
    }
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching payments:', error);
    // Even if it throws, return local data as fallback instead of 500 error
    const localPayments = getPaymentsFromLocalFile();
    res.json(localPayments);
  }
});

// PUT /api/payments/:listingId/pay - Toggle/set bank transfer payment status in Supabase (with Local File Fallback)
app.put('/api/payments/:listingId/pay', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { status } = req.body; // Expect 'Completed' or 'Pending'
    const newStatus = status === 'Pending' ? 'Pending' : 'Completed';
    
    // 1. Try to update the payment status in the payments table in Supabase
    let query = supabase.from('payments').update({ payment_status: newStatus });
    
    if (isNaN(listingId)) {
      query = query.eq('id', listingId);
    } else {
      query = query.or(`listing_id.eq.${listingId},id.eq.${listingId}`);
    }

    const { data: updatedPayments, error: paymentUpdateError } = await query.select();

    if (paymentUpdateError || !updatedPayments || updatedPayments.length === 0) {
      console.warn("Supabase payment update failed (table may not exist), attempting local file update...");
      const updatedLocal = updatePaymentInLocalFile(listingId, newStatus);
      if (updatedLocal) {
        // Also update description of listing in Supabase if listings table exists
        await updateListingDescriptionInSupabase(updatedLocal.listing_id, newStatus);
        return res.json({ success: true, message: 'Payment status updated in local file database!', payment: updatedLocal });
      }
      return res.status(404).json({ error: 'Payment record not found in database or local file fallback.' });
    }
    
    const targetListingId = updatedPayments[0].listing_id;
    
    // 2. Fetch the corresponding listing from Supabase
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('description')
      .eq('id', targetListingId)
      .single();
      
    if (fetchError || !listing) {
      return res.status(404).json({ error: 'Associated listing not found in Supabase.' });
    }
    
    // 3. Update its payment status inside description
    let desc = listing.description || '';
    if (newStatus === 'Completed') {
      if (desc.includes('Payment Status: Pending')) {
        desc = desc.replace('Payment Status: Pending', 'Payment Status: Completed');
      } else if (!desc.includes('Payment Status: Completed')) {
        desc += '\nPayment Status: Completed';
      }
    } else {
      if (desc.includes('Payment Status: Completed')) {
        desc = desc.replace('Payment Status: Completed', 'Payment Status: Pending');
      } else if (!desc.includes('Payment Status: Pending')) {
        desc += '\nPayment Status: Pending';
      }
    }
    
    const { error: updateError } = await supabase
      .from('listings')
      .update({ description: desc })
      .eq('id', targetListingId);
      
    if (updateError) {
      throw updateError;
    }
    
    res.json({ success: true, message: 'Payment marked as completed successfully!', payment: updatedPayments[0] });
  } catch (error) {
    console.error('Error updating payment status:', error);
    // Last resort local fallback
    const updatedLocal = updatePaymentInLocalFile(listingId, newStatus);
    if (updatedLocal) {
      return res.json({ success: true, message: 'Payment status updated in local file database on error fallback!', payment: updatedLocal });
    }
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// GET /api/users - Retrieve all registered portal users from Supabase
app.get('/api/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users || []);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// GET /api/users/:identifier - Retrieve details for a specific portal user by username, email or mobile
app.get('/api/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { data: user, error } = await supabase
      .from('portal_users')
      .select('id, username, email, mobile, first_name, last_name, auth_provider, created_at')
      .or(`username.eq.${identifier},email.eq.${identifier},mobile.eq.${identifier}`)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

// Start the server locally (if not in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is actively listening on http://localhost:${PORT}`);
  });
}


// Export the Express API for Vercel Serverless Functions
module.exports = app;