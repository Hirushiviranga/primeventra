import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

const INITIAL_PROPERTIES = [
  { id: 1, icon: 'bx bx-home', name: 'Luxury House for Sale',  meta: '4 Beds • 3 Baths • 3200 sqft', type: 'House',      loc: 'Colombo 05',  price: 'LKR 85M',  status: 'available', statusText: 'Available', date: 'Jun 1, 2025', description: 'Stunning luxury house located in Colombo 05 with a beautifully landscaped garden, high ceilings, custom wood finishes, and 24/7 security.', mapLink: 'https://maps.google.com/?q=Colombo+05' },
  { id: 2, icon: 'bx bx-landscape', name: 'Residential Land',        meta: '20 Perches',                   type: 'Land',       loc: 'Malabe',      price: 'LKR 22M',  status: 'reserved',  statusText: 'Reserved',  date: 'May 28, 2025', description: 'Excellent 20 perch residential block in Malabe. Cleared land ready for building with easy access to the highway, local schools, and supermarkets.', mapLink: 'https://maps.google.com/?q=Malabe' },
  { id: 4, icon: 'bx bx-building', name: 'Modern Apartment',        meta: '3 Beds • 2 Baths • 1400 sqft', type: 'Apartment',  loc: 'Rajagiriya',  price: 'LKR 48M',  status: 'available', statusText: 'Available', date: 'Jun 5, 2025', description: 'Modern 3-bedroom apartment on a high floor in Rajagiriya, offering breathtaking views, shared pool, gym, parking space, and fully air-conditioned rooms.', mapLink: 'https://maps.google.com/?q=Rajagiriya' },
  { id: 5, icon: 'bx bx-landscape', name: 'Agricultural Land',       meta: '2 Acres',                      type: 'Land',       loc: 'Gampaha',     price: 'LKR 35M',  status: 'available', statusText: 'Available', date: 'Jun 8, 2025', description: 'Beautiful 2-acre agricultural land in Gampaha. Ideal for farming, estate building, or long-term cultivation investment.', mapLink: 'https://maps.google.com/?q=Gampaha' },
]

const INITIAL_SUBMISSIONS = [
  {
    id: 101,
    icon: 'bx bx-landscape',
    name: 'Land for Sale',
    meta: 'Land • 15 Perches',
    owner: 'Roshan Bandara',
    loc: 'Kottawa, Colombo',
    district: 'Colombo',
    city: 'Kottawa',
    landType: 'Residential',
    size: '15',
    unit: 'Perches (පර්චස්)',
    price: 'LKR 18M',
    date: 'Jun 10, 2025',
    description: 'Owner submitted 15 perch residential land in Kottawa.',
    mapLink: 'https://maps.google.com/?q=Kottawa',
    status: 'Available',
    negotiable: 'No'
  },
  {
    id: 102,
    icon: 'bx bx-home',
    name: 'House for Sale',
    meta: 'House • 3 Beds • 2 Baths • 2200 sqft',
    owner: 'Dilani Jayawardena',
    loc: 'Maharagama, Colombo',
    district: 'Colombo',
    city: 'Maharagama',
    landSize: '8',
    unit: 'Perches (පර්චස්)',
    houseSize: '2200',
    houseType: 'Double Story',
    bedrooms: '3',
    bathrooms: '2',
    completionStatus: 'Ready (සූදානම්)',
    furnishedStatus: 'Fully Furnished',
    price: 'LKR 45M',
    date: 'Jun 9, 2025',
    description: 'Owner submitted 3-bedroom double story house in Maharagama.',
    mapLink: 'https://maps.google.com/?q=Maharagama',
    status: 'Available',
    negotiable: 'Yes'
  },
]

const INITIAL_ENQUIRIES = [
  { id: 201, client: 'Nimal Perera',     interest: 'Luxury House — Colombo 05',  contact: '077 123 4567', date: 'Today, 10:30 AM', status: 'new-badge', statusText: 'New', msg: 'Interested in Luxury House for Sale in Colombo 05. Requested a site visit.' },
  { id: 202, client: 'Shanika Fernando', interest: 'Residential Land — Malabe',   contact: '071 987 6543', date: 'Yesterday',      status: 'reserved',  statusText: 'Contacted', msg: 'Asked about residential land in Malabe and payment options.' },
  { id: 203, client: 'Kasun Silva',      interest: 'Modern Apartment — Rajagiriya', contact: '076 555 1234', date: '2 days ago',     status: 'new-badge', statusText: 'New', msg: 'Looking for a 3-bedroom modern apartment near Rajagiriya.' },
]

const INITIAL_FEATURED = [
  { id: 301, icon: 'bx bx-home', name: 'Luxury House for Sale', meta: 'House • 4 Beds', loc: 'Colombo 05', price: 'LKR 85M', until: 'Jul 15, 2025', propertyId: 1 }
]

export function AdminProvider({ children }) {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES)
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES)
  const [featured, setFeatured] = useState(INITIAL_FEATURED)
  const [adminPassword, setAdminPassword] = useState('admin123')

  // Change password handler
  const changePassword = (currentPass, newPass) => {
    if (currentPass !== adminPassword) {
      return { success: false, message: 'Current password is incorrect.' }
    }
    setAdminPassword(newPass)
    return { success: true, message: 'Password updated successfully!' }
  }

  // Property CRUD
  const addProperty = (newProp) => {
    const formattedProp = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...newProp
    }
    setProperties(prev => [formattedProp, ...prev])
  }

  const deleteProperty = (id) => {
    setProperties(prev => prev.filter(p => p.id !== id))
    setFeatured(prev => prev.filter(f => f.propertyId !== id))
  }

  // Submission Management
  const approveSubmission = (id) => {
    const submission = submissions.find(s => s.id === id)
    if (!submission) return

    // Remove from submissions
    setSubmissions(prev => prev.filter(s => s.id !== id))

    // Add to properties
    const newProp = {
      id: Date.now(),
      icon: submission.icon,
      name: submission.name,
      meta: submission.meta,
      type: submission.icon.includes('landscape') ? 'Land' : (submission.icon.includes('building') ? 'Apartment' : 'House'),
      loc: submission.loc,
      price: submission.price,
      status: submission.status ? submission.status.toLowerCase() : 'available',
      statusText: submission.status || 'Available',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: submission.description || '',
      mapLink: submission.mapLink || '',
      district: submission.district || '',
      city: submission.city || '',
      size: submission.size || '',
      landSize: submission.landSize || '',
      unit: submission.unit || '',
      houseSize: submission.houseSize || '',
      houseType: submission.houseType || '',
      bedrooms: submission.bedrooms || '',
      bathrooms: submission.bathrooms || '',
      completionStatus: submission.completionStatus || '',
      furnishedStatus: submission.furnishedStatus || '',
      apartmentComplex: submission.apartmentComplex || '',
      floorNumber: submission.floorNumber || '',
      totalFloors: submission.totalFloors || '',
      parking: submission.parking || '',
      amenities: submission.amenities || '',
      negotiable: submission.negotiable || 'No'
    }
    setProperties(prev => [newProp, ...prev])
  }

  const rejectSubmission = (id) => {
    setSubmissions(prev => prev.filter(s => s.id !== id))
  }

  // Featured Management
  const addFeaturedProperty = (propertyId, untilDate) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    // Check if already featured
    if (featured.some(f => f.propertyId === propertyId)) return

    const newFeatured = {
      id: Date.now(),
      icon: property.icon,
      name: property.name,
      meta: property.meta,
      loc: property.loc,
      price: property.price,
      until: untilDate || 'Aug 1, 2025',
      propertyId: property.id
    }
    setFeatured(prev => [newFeatured, ...prev])
  }

  const removeFeaturedProperty = (id) => {
    setFeatured(prev => prev.filter(f => f.id !== id))
  }

  // Enquiry Management
  const replyToEnquiry = (id) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'reserved', statusText: 'Contacted' } : e))
  }

  // Submission Editing
  const updateSubmission = (updatedSub) => {
    setSubmissions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s))
  }

  return (
    <AdminContext.Provider value={{
      properties,
      submissions,
      enquiries,
      featured,
      adminPassword,
      changePassword,
      addProperty,
      deleteProperty,
      approveSubmission,
      rejectSubmission,
      addFeaturedProperty,
      removeFeaturedProperty,
      replyToEnquiry,
      updateSubmission
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
