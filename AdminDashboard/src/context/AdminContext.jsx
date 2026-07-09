import { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext()

const INITIAL_ENQUIRIES = []

const INITIAL_FEATURED = []

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://primeventra-vrmv.vercel.app/api';

export function AdminProvider({ children }) {
  const [properties, setProperties] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [drafts, setDrafts] = useState([])
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES)
  const [featured, setFeatured] = useState(INITIAL_FEATURED)
  const [adminPassword, setAdminPassword] = useState('admin123')

  // Fetch listings and drafts from backend database on load
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/listings`).then(res => {
        if (!res.ok) throw new Error('HTTP status ' + res.status);
        return res.json();
      }),
      fetch(`${API_BASE}/drafts`).then(res => {
        if (!res.ok) throw new Error('HTTP status ' + res.status);
        return res.json();
      })
    ])
    .then(([listingsData, draftsData]) => {
      const subs = [];
      const props = [];
      const draftsList = [];

      listingsData.forEach(item => {
        const isPending = item.description && item.description.includes('Status: Pending');
        const isDraft = item.description && item.description.includes('Status: Draft');
        const isSold = item.description && item.description.includes('Status: Sold');

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
          status: isDraft ? 'draft' : (isPending ? 'pending' : (isSold ? 'sold' : 'available')),
          statusText: isDraft ? 'Draft' : (isPending ? 'Pending' : (isSold ? 'Sold' : 'Available')),
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

        if (isDraft) {
          draftsList.push(formatted);
        } else if (isPending) {
          subs.push(formatted);
        } else {
          props.push(formatted);
        }
      });

      // Format drafts table data
      draftsData.forEach(item => {
        const parseDescField = (desc, label) => {
          if (!desc) return '';
          const regex = new RegExp(`${label}:\\s*(.*)`);
          const match = desc.match(regex);
          return match ? match[1].trim() : '';
        };

        const ownerName = parseDescField(item.description, 'Contact Person') || 'Anonymous';
        const phoneVal = parseDescField(item.description, 'Phone') || '';
        const whatsappVal = parseDescField(item.description, 'WhatsApp') || '';
        const emailVal = parseDescField(item.description, 'Email') || '';

        const formatted = {
          id: item.property_id || item.id,
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
          status: 'draft',
          statusText: 'Draft',
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
          negotiable: parseDescField(item.description, 'Negotiable') || 'No',
          featured: 'No',
          rawPrice: item.price || 0,
          photos: item.photos || []
        };
        draftsList.push(formatted);
      });

      setSubmissions(subs);
      setProperties(props);
      setDrafts(draftsList);
    })
    .catch(err => console.error("Error loading admin listings and drafts:", err));
  }, []);

  // Fetch enquiries from backend database on load
  useEffect(() => {
    fetch(`${API_BASE}/enquiries`)
      .then(res => {
        if (!res.ok) throw new Error('HTTP status ' + res.status);
        return res.json();
      })
      .then(data => {
        setEnquiries(data);
      })
      .catch(err => console.error("Error loading admin enquiries:", err));
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
    const payload = {
      type: newProp.type,
      title: newProp.name,
      description: newProp.description || '',
      price: String(newProp.price).replace(/[^\d.]/g, ''),
      district: newProp.district || 'Colombo',
      city: newProp.city || 'Unknown',
      status: newProp.status || 'Draft',
      negotiable: newProp.negotiable || 'No',
      mapLink: newProp.mapLink || '',
      submittedBy: 'Admin',
      firstName: newProp.owner || 'Admin',
      lastName: '',
      phone: newProp.phone || '',
      whatsapp: newProp.whatsapp || '',
      email: newProp.email || '',
      bedrooms: newProp.bedrooms || null,
      bathrooms: newProp.bathrooms || null,
      houseSize: newProp.type === 'House' ? newProp.size : null,
      apartmentSize: newProp.type === 'Apartment' ? newProp.size : null,
      landSize: newProp.type === 'Land' ? newProp.size : null,
      landUnit: newProp.unit ? newProp.unit.split(' ')[0] : 'Perches',
      landType: newProp.landType || null,
      apartmentComplex: newProp.apartmentComplex || '',
      floorNumber: newProp.floorNumber || '',
      totalFloors: newProp.totalFloors || '',
      parking: newProp.parking || 'No Parking',
      amenities: newProp.amenities || 'None',
      completionStatus: newProp.completionStatus || 'Ready',
      furnishedStatus: newProp.furnishedStatus || 'Unfurnished'
    };

    return fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to create property on backend');
      return res.json();
    })
    .then(result => {
      const item = result.data && result.data[0];
      if (!item) throw new Error('No data returned');

      const parseDescField = (desc, label) => {
        if (!desc) return '';
        const regex = new RegExp(`${label}:\\s*(.*)`);
        const match = desc.match(regex);
        return match ? match[1].trim() : '';
      };

      const isPending = item.description && item.description.includes('Status: Pending');
      const isDraft = item.description && item.description.includes('Status: Draft');

      const formatted = {
        id: item.id,
        icon: item.type === 'Land' ? 'bx bx-landscape' : (item.type === 'Apartment' ? 'bx bx-building' : 'bx bx-home'),
        name: item.title,
        meta: item.type === 'Land' 
          ? `Land • ${item.land_size_perches || 0} Perches` 
          : `${item.type} • ${item.bedrooms || 0} Beds • ${item.bathrooms || 0} Baths • ${item.size_sqft || 0} sqft`,
        type: item.type,
        owner: parseDescField(item.description, 'Contact Person') || 'Admin',
        phone: parseDescField(item.description, 'Phone') || '',
        whatsapp: parseDescField(item.description, 'WhatsApp') || '',
        email: parseDescField(item.description, 'Email') || '',
        loc: `${item.city || 'Unknown'}, ${item.district || 'Colombo'}`,
        price: item.price ? `LKR ${Number(item.price).toLocaleString()}` : 'LKR 0',
        status: isDraft ? 'draft' : 'pending',
        statusText: isDraft ? 'Draft' : 'Pending',
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
        negotiable: parseDescField(item.description, 'Negotiable') || 'No',
        featured: 'No',
        photos: item.photos || []
      };

      if (isDraft) {
        setDrafts(prev => [formatted, ...prev]);
      } else {
        setSubmissions(prev => [formatted, ...prev]);
      }
      return formatted;
    })
    .catch(err => {
      console.error("Error creating draft/submission:", err);
      alert("Failed to create listing: " + err.message);
    });
  }

  const deleteProperty = (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }
    const isDraft = drafts.some(d => String(d.id) === String(id));
    const deleteUrl = isDraft ? `${API_BASE}/drafts/${id}` : `${API_BASE}/listings/${id}`;

    fetch(deleteUrl, {
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
      setProperties(prev => prev.filter(p => String(p.id) !== String(id)))
      setSubmissions(prev => prev.filter(s => String(s.id) !== String(id)))
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)))
      setFeatured(prev => prev.filter(f => String(f.propertyId) !== String(id)))
    })
    .catch(err => {
      console.error("Error deleting property:", err);
      alert("Failed to delete property: " + err.message);
    });
  }

  // Submission Management
  const approveSubmission = (id) => {
    const isDraft = drafts.some(d => String(d.id) === String(id));
    const approveUrl = isDraft ? `${API_BASE}/drafts/${id}/approve` : `${API_BASE}/listings/${id}/approve`;

    fetch(approveUrl, {
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
    .then((result) => {
      const submission = submissions.find(s => String(s.id) === String(id)) || drafts.find(d => String(d.id) === String(id));
      if (!submission) return;

      // Remove from submissions & drafts
      setSubmissions(prev => prev.filter(s => String(s.id) !== String(id)));
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));

      // Add to properties
      const finalItem = (result.data && result.data[0]) || submission;
      
      const parseDescField = (desc, label) => {
        if (!desc) return '';
        const regex = new RegExp(`${label}:\\s*(.*)`);
        const match = desc.match(regex);
        return match ? match[1].trim() : '';
      };

      const ownerName = parseDescField(finalItem.description, 'Contact Person') || submission.owner || 'Anonymous';
      const phoneVal = parseDescField(finalItem.description, 'Phone') || submission.phone || '';
      const whatsappVal = parseDescField(finalItem.description, 'WhatsApp') || submission.whatsapp || '';
      const emailVal = parseDescField(finalItem.description, 'Email') || submission.email || '';

      setProperties(prev => [{
        ...submission,
        id: finalItem.id || id,
        owner: ownerName,
        phone: phoneVal,
        whatsapp: whatsappVal,
        email: emailVal,
        description: finalItem.description || submission.description || '',
        status: 'available',
        statusText: 'Available'
      }, ...prev]);
    })
    .catch(err => {
      console.error("Error approving submission:", err);
      alert("Failed to approve: " + err.message);
    });
  }

  const rejectSubmission = (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this submission?")) {
      return;
    }
    const isDraft = drafts.some(d => String(d.id) === String(id));
    const deleteUrl = isDraft ? `${API_BASE}/drafts/${id}` : `${API_BASE}/listings/${id}`;

    fetch(deleteUrl, {
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
      setSubmissions(prev => prev.filter(s => String(s.id) !== String(id)));
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
    })
    .catch(err => {
      console.error("Error rejecting submission:", err);
      alert("Failed to reject submission: " + err.message);
    });
  }

  const rejectDraft = (id, reason) => {
    return fetch(`${API_BASE}/drafts/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to reject draft');
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
      return true;
    });
  }

  const toggleDraftPayment = (id, paid, packageName = null, packagePrice = null) => {
    return fetch(`${API_BASE}/drafts/${id}/toggle-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paid, packageName, packagePrice })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to toggle draft payment status');
      setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
      return true;
    });
  }

  const reversePayment = (paymentId) => {
    return fetch(`${API_BASE}/payments/${paymentId}/reverse`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw new Error(e.error || 'Server error') });
      }
      return true;
    });
  }

  const approveManualPayment = (paymentId) => {
    return fetch(`${API_BASE}/payments/${paymentId}/approve-manual`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw new Error(e.error || 'Server error') });
      }
      return true;
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
    fetch(`${API_BASE}/enquiries/${id}/reply`, {
      method: 'PUT'
    })
    .then(res => {
      if (!res.ok) throw new Error('HTTP status ' + res.status);
      return res.json();
    })
    .then(() => {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'reserved', statusText: 'Contacted' } : e));
    })
    .catch(err => {
      console.error("Error updating enquiry status:", err);
      alert("Failed to update status: " + err.message);
    });
  }

  // Property & Submission Editing
  const updateProperty = (id, updatedProp, forceDraft = false) => {
    const isDraft = forceDraft || drafts.some(d => String(d.id) === String(id));
    const updateUrl = isDraft ? `${API_BASE}/drafts/${id}` : `${API_BASE}/listings/${id}`;

    const isPending = updatedProp.status === 'pending';
    const isSold = updatedProp.status === 'sold';
    const statusText = isDraft ? 'Draft' : (isPending ? 'Pending' : (isSold ? 'Sold' : 'Available'));
    const statusVal = isDraft ? 'Draft' : (isPending ? 'Pending' : (isSold ? 'Sold' : 'Approved'));

    // Construct payload
    const payload = {
      type: updatedProp.type,
      title: updatedProp.name || updatedProp.title,
      description: updatedProp.description || '',
      price: String(updatedProp.price).replace(/[^\d.]/g, ''),
      district: updatedProp.district || 'Colombo',
      city: updatedProp.city || 'Unknown',
      status: statusVal,
      negotiable: updatedProp.negotiable || 'No',
      mapLink: updatedProp.mapLink || '',
      submittedBy: updatedProp.owner || 'Guest',
      email: updatedProp.email || '',
      phone: updatedProp.phone || '',
      whatsapp: updatedProp.whatsapp || '',
      bedrooms: updatedProp.bedrooms || null,
      bathrooms: updatedProp.bathrooms || null,
      houseSize: updatedProp.type === 'House' ? updatedProp.size : null,
      apartmentSize: updatedProp.type === 'Apartment' ? updatedProp.size : null,
      landSize: updatedProp.type === 'Land' ? updatedProp.size : null,
      landUnit: updatedProp.unit || 'Perches',
      landType: updatedProp.landType || null,
      apartmentComplex: updatedProp.apartmentComplex || '',
      floorNumber: updatedProp.floorNumber || '',
      totalFloors: updatedProp.totalFloors || '',
      parking: updatedProp.parking || 'No Parking',
      amenities: updatedProp.amenities || 'None',
      completionStatus: updatedProp.completionStatus || 'Ready',
      furnishedStatus: updatedProp.furnishedStatus || 'Unfurnished',
      photos: updatedProp.photos || []
    };

    return fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
        id: item.property_id || item.id,
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
        status: isDraft ? 'draft' : (isPending ? 'pending' : (isSold ? 'sold' : 'available')),
        statusText: isDraft ? 'Draft' : (isPending ? 'Pending' : (isSold ? 'Sold' : 'Available')),
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

      if (isDraft) {
        setDrafts(prev => prev.map(d => String(d.id) === String(id) ? formatted : d));
      } else if (isPending) {
        setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
        setSubmissions(prev => {
          if (prev.some(s => String(s.id) === String(id))) {
            return prev.map(s => String(s.id) === String(id) ? formatted : s);
          } else {
            return [formatted, ...prev];
          }
        });
      } else {
        setDrafts(prev => prev.filter(d => String(d.id) !== String(id)));
        setProperties(prev => prev.map(p => String(p.id) === String(id) ? formatted : p));
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
      drafts,
      setDrafts,
      enquiries,
      featured,
      adminPassword,
      changePassword,
      addProperty,
      deleteProperty,
      approveSubmission,
      rejectSubmission,
      rejectDraft,
      toggleDraftPayment,
      reversePayment,
      approveManualPayment,
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
