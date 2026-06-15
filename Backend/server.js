import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database files if they don't exist
const initFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
  }
};
initFile(LISTINGS_FILE);
initFile(MESSAGES_FILE);

// Helper to read JSON file
const readData = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    return [];
  }
};

// Helper to write JSON file
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// GET /api/listings - Retrieve all listings
app.get('/api/listings', (req, res) => {
  const listings = readData(LISTINGS_FILE);
  res.json({ success: true, count: listings.length, data: listings });
});

// POST /api/listings - Submit a listing (house, apartment, land)
app.post('/api/listings', (req, res) => {
  const newListing = req.body;
  
  if (!newListing.title || !newListing.price || !newListing.phone) {
    return res.status(400).json({ success: false, error: 'Missing required fields: title, price, phone' });
  }

  const listings = readData(LISTINGS_FILE);
  
  // Assign a unique ID and timestamp
  const listingWithMeta = {
    id: 'lst_' + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    ...newListing
  };

  listings.push(listingWithMeta);
  writeData(LISTINGS_FILE, listings);

  res.status(201).json({ success: true, message: 'Listing created successfully', data: listingWithMeta });
});

// GET /api/contact - Retrieve all contact messages
app.get('/api/contact', (req, res) => {
  const messages = readData(MESSAGES_FILE);
  res.json({ success: true, count: messages.length, data: messages });
});

// POST /api/contact - Submit contact message
app.post('/api/contact', (req, res) => {
  const newMessage = req.body;

  if (!newMessage.name || !newMessage.email || !newMessage.subject || !newMessage.message) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, email, subject, message' });
  }

  const messages = readData(MESSAGES_FILE);

  const messageWithMeta = {
    id: 'msg_' + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    ...newMessage
  };

  messages.push(messageWithMeta);
  writeData(MESSAGES_FILE, messages);
  res.status(201).json({ success: true, message: 'Contact message received successfully', data: messageWithMeta });
});

// DELETE /api/listings/:id - Delete a listing
app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  const listings = readData(LISTINGS_FILE);
  const filteredListings = listings.filter(item => item.id !== id);

  if (listings.length === filteredListings.length) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  writeData(LISTINGS_FILE, filteredListings);
  res.json({ success: true, message: 'Listing deleted successfully' });
});

// PUT /api/listings/:id/status - Update status of a listing
app.put('/api/listings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Missing required field: status' });
  }

  const listings = readData(LISTINGS_FILE);
  const listingIndex = listings.findIndex(item => item.id === id);

  if (listingIndex === -1) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  listings[listingIndex].status = status;
  writeData(LISTINGS_FILE, listings);

  res.json({ success: true, message: 'Listing status updated successfully', data: listings[listingIndex] });
});

// Serve static files from Frontend build
const FE_DIST = path.join(__dirname, '..', 'Frontend', 'dist');
if (fs.existsSync(FE_DIST)) {
  app.use(express.static(FE_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FE_DIST, 'index.html'));
  });
  console.log(`Serving frontend static files from: ${FE_DIST}`);
} else {
  console.log(`Frontend build folder not found at: ${FE_DIST}. Running API-only server.`);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
