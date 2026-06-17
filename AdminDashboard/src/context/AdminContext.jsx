import { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext()

const INITIAL_ENQUIRIES = []

const INITIAL_FEATURED = []

export function AdminProvider({ children }) {
  const [properties, setProperties] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES)
  const [featured, setFeatured] = useState(INITIAL_FEATURED)
  const [adminPassword, setAdminPassword] = useState('admin123')

  // Fetch listings from backend database on load
  useEffect(() => {
    fetch('http://localhost:5000/api/listings')
      .then(res => {
        if (!res.ok) throw new Error('HTTP status ' + res.status);
        return res.json();
      })
      .then(data => {
        const subs = [];
        const props = [];

        data.forEach(item => {
          const isPending = item.description && item.description.includes('Status: Pending');

          // Helper to parse description values
          const parseDescField = (desc, label) => {
            if (!desc) return '';
            const regex = new RegExp(`${label}:\\s*(.*)`);
            const match = desc.match(regex);
            return match ? match[1].trim() : '';
          };

          const ownerName = parseDescField(item.description, 'Contact Person') || 'Anonymous';
          const negotiableVal = parseDescField(item.description, 'Negotiable') || 'No';
          const phoneVal = parseDescField(item.description, 'Phone') || '';
          const whatsappVal = parseDescField(item.description, 'WhatsApp') || '';
          const emailVal = parseDescField(item.description, 'Email') || '';

          const formatted = {
            id: item.id,
            icon: item.type === 'Land' ? 'bx bx-landscape' : (item.type === 'Apartment' ? 'bx bx-building' : 'bx bx-home'),
            name: item.title,
            meta: item.type === 'Land' 
              ? `Land • ${item.land_size_perches || 0} Perches` 
              : `${item.type} • ${item.bedrooms || 0} Beds • ${item.bathrooms || 0} Baths • ${item.size_sqft || 0} sqft`,
            type: item.type,
            owner: ownerName,
            phone: phoneVal,
            whatsapp: whatsappVal,
            email: emailVal,
            loc: `${item.city || 'Unknown'}, ${item.district || 'Colombo'}`,
            price: item.price ? `LKR ${Number(item.price).toLocaleString()}` : 'LKR 0',
            status: isPending ? 'pending' : 'available',
            statusText: isPending ? 'Pending' : 'Available',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
            description: item.description || '',
            mapLink: parseDescField(item.description, 'Google Map Link') || '',
            district: item.district || '',
            city: item.city || '',
            size: item.size_sqft || '',
            landSize: item.land_size_perches || '',
            landType: item.land_type || parseDescField(item.description, 'Land Type') || 'Residential',
            unit: 'Perches',
            houseSize: item.size_sqft || '',
            bedrooms: item.bedrooms || '',
            bathrooms: item.bathrooms || '',
            completionStatus: parseDescField(item.description, 'Completion Status') || 'Ready',
            furnishedStatus: parseDescField(item.description, 'Furnished Status') || 'Unfurnished',
            apartmentComplex: parseDescField(item.description, 'Apartment Complex') || '',
            floorNumber: parseDescField(item.description, 'Floor Number') || '',
            totalFloors: parseDescField(item.description, 'Total Floors') || '',
            parking: parseDescField(item.description, 'Parking') || 'No Parking',
            amenities: parseDescField(item.description, 'Amenities') || 'None',
            negotiable: negotiableVal,
            featured: parseDescField(item.description, 'Featured') || 'No',
            rawPrice: item.price || 0,
            photos: item.photos || []
          };

          if (isPending) {
            subs.push(formatted);
          } else {
            props.push(formatted);
          }
        });

        setSubmissions(subs);
        setProperties(props);
      })
      .catch(err => console.error("Error loading admin listings:", err));
  }, []);

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
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }
    fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || 'HTTP status ' + res.status);
        }).catch(() => {
          throw new Error('HTTP status ' + res.status);
        });
      }
      setProperties(prev => prev.filter(p => p.id !== id))
      setFeatured(prev => prev.filter(f => f.propertyId !== id))
    })
    .catch(err => {
      console.error("Error deleting property:", err);
      alert("Failed to delete property: " + err.message);
    });
  }

  // Submission Management
  const approveSubmission = (id) => {
    fetch(`http://localhost:5000/api/listings/${id}/approve`, {
      method: 'PUT'
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || 'HTTP status ' + res.status);
        }).catch(() => {
          throw new Error('HTTP status ' + res.status);
        });
      }
      return res.json();
    })
    .then(() => {
      const submission = submissions.find(s => s.id === id);
      if (!submission) return;

      // Remove from submissions
      setSubmissions(prev => prev.filter(s => s.id !== id));

      // Add to properties
      setProperties(prev => [{
        ...submission,
        status: 'available',
        statusText: 'Available'
      }, ...prev]);
    })
    .catch(err => {
      console.error("Error approving submission:", err);
      alert("Failed to approve submission: " + err.message);
    });
  }

  const rejectSubmission = (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this submission?")) {
      return;
    }
    fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || 'HTTP status ' + res.status);
        }).catch(() => {
          throw new Error('HTTP status ' + res.status);
        });
      }
      setSubmissions(prev => prev.filter(s => s.id !== id));
    })
    .catch(err => {
      console.error("Error rejecting submission:", err);
      alert("Failed to reject submission: " + err.message);
    });
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

  // Property & Submission Editing
  const updateProperty = (id, updatedProp) => {
    const isPending = updatedProp.status === 'pending';
    const statusText = isPending ? 'Pending' : 'Available';
    const statusVal = isPending ? 'Pending' : 'Approved';

    return fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...updatedProp,
        title: updatedProp.name,
        price: String(updatedProp.price).replace(/[^\d.]/g, ''),
        status: statusVal,
        landUnit: updatedProp.unit || 'Perches',
        landSize: updatedProp.landSize || updatedProp.size || '',
        houseSize: updatedProp.houseSize || updatedProp.size || '',
        apartmentSize: updatedProp.size || updatedProp.apartmentSize || ''
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || 'HTTP status ' + res.status);
        }).catch(() => {
          throw new Error('HTTP status ' + res.status);
        });
      }
      return res.json();
    })
    .then(result => {
      if (!result.data || result.data.length === 0) {
        throw new Error('No updated data returned from the server.');
      }
      const item = result.data[0];
      
      const parseDescField = (desc, label) => {
        if (!desc) return '';
        const regex = new RegExp(`${label}:\\s*(.*)`);
        const match = desc.match(regex);
        return match ? match[1].trim() : '';
      };

      const ownerName = parseDescField(item.description, 'Contact Person') || 'Anonymous';
      const negotiableVal = parseDescField(item.description, 'Negotiable') || 'No';
      const phoneVal = parseDescField(item.description, 'Phone') || '';
      const whatsappVal = parseDescField(item.description, 'WhatsApp') || '';
      const emailVal = parseDescField(item.description, 'Email') || '';

      const formatted = {
        id: item.id,
        icon: item.type === 'Land' ? 'bx bx-landscape' : (item.type === 'Apartment' ? 'bx bx-building' : 'bx bx-home'),
        name: item.title,
        meta: item.type === 'Land' 
          ? `Land • ${item.land_size_perches || 0} Perches` 
          : `${item.type} • ${item.bedrooms || 0} Beds • ${item.bathrooms || 0} Baths • ${item.size_sqft || 0} sqft`,
        type: item.type,
        owner: ownerName,
        phone: phoneVal,
        whatsapp: whatsappVal,
        email: emailVal,
        loc: `${item.city || 'Unknown'}, ${item.district || 'Colombo'}`,
        price: item.price ? `LKR ${Number(item.price).toLocaleString()}` : 'LKR 0',
        rawPrice: item.price || 0,
        status: isPending ? 'pending' : 'available',
        statusText: statusText,
        date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
        description: item.description || '',
        mapLink: parseDescField(item.description, 'Google Map Link') || '',
        district: item.district || '',
        city: item.city || '',
        size: item.size_sqft || '',
        landSize: item.land_size_perches || '',
        landType: item.land_type || parseDescField(item.description, 'Land Type') || 'Residential',
        unit: 'Perches',
        houseSize: item.size_sqft || '',
        bedrooms: item.bedrooms || '',
        bathrooms: item.bathrooms || '',
        completionStatus: parseDescField(item.description, 'Completion Status') || 'Ready',
        furnishedStatus: parseDescField(item.description, 'Furnished Status') || 'Unfurnished',
        apartmentComplex: parseDescField(item.description, 'Apartment Complex') || '',
        floorNumber: parseDescField(item.description, 'Floor Number') || '',
        totalFloors: parseDescField(item.description, 'Total Floors in Building') || parseDescField(item.description, 'Total Floors') || '',
        parking: parseDescField(item.description, 'Parking') || 'No Parking',
        amenities: parseDescField(item.description, 'Amenities') || 'None',
        negotiable: negotiableVal,
        featured: parseDescField(item.description, 'Featured') || 'No',
        photos: item.photos || []
      };

      if (isPending) {
        setSubmissions(prev => prev.map(s => s.id === id ? formatted : s));
      } else {
        setProperties(prev => prev.map(p => p.id === id ? formatted : p));
      }
      return formatted;
    });
  }

  const updateSubmission = (updatedSub) => {
    return updateProperty(updatedSub.id, updatedSub);
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
      updateSubmission,
      updateProperty
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
