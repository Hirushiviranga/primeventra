import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PaymentGateway from '../../components/PaymentGateway';
import '../../styles/profile.css';
import { jsPDF } from 'jspdf';
import logo from '../../assets/logo1.png';
import { supabase } from '../../api/supabaseClient';
import { COUNTRY_CODES, validatePhoneNumber } from '../../constants/countries';

const CountrySelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedCountry = COUNTRY_CODES.find(c => c.iso === value) || COUNTRY_CODES[0];

  const handleSelect = (iso) => {
    if (disabled) return;
    onChange(iso);
    setIsOpen(false);
  };

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm)
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          paddingRight: '8px',
          borderRight: '1px solid var(--color-outline-variant)',
          marginRight: '10px'
        }}
      >
        <img 
          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
          alt={selectedCountry.name}
          style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
        />
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)' }}>{selectedCountry.code}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginLeft: '-2px' }}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '130%',
            left: 0,
            zIndex: 9999,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '220px',
            overflowY: 'auto',
            width: '210px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', padding: '6px', borderBottom: '1px solid var(--color-outline-variant)' }}>
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                boxSizing: 'border-box'
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredCountries.map(c => (
              <div 
                key={`${c.iso}-${c.code}`}
                onClick={() => handleSelect(c.iso)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: c.iso === value ? 'var(--color-surface-container)' : 'transparent',
                  textAlign: 'left'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = c.iso === value ? 'var(--color-surface-container)' : 'transparent'}
              >
                <img 
                  src={`https://flagcdn.com/w40/${c.iso}.png`} 
                  alt={c.name}
                  style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>{c.name} ({c.code})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [soldProperties, setSoldProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'listings';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('lk');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [drafts, setDrafts] = useState([]);

  // Extra Calls States
  const [extraCallsProperty, setExtraCallsProperty] = useState(null);
  const [extraCallsCount, setExtraCallsCount] = useState(40);
  const [extraCallsPrice, setExtraCallsPrice] = useState(4000);
  const [showExtraCallsWindow, setShowExtraCallsWindow] = useState(false);
  const [showExtraCallsGateway, setShowExtraCallsGateway] = useState(false);
  const [extraCallsPaymentStep, setExtraCallsPaymentStep] = useState(2);
  const [extraCallsPaymentMethod, setExtraCallsPaymentMethod] = useState('Online');
  const [extraCallsBankSubmitOption, setExtraCallsBankSubmitOption] = useState('upload');
  const [extraCallsSubmitting, setExtraCallsSubmitting] = useState(false);
  const [extraCallsSuccess, setExtraCallsSuccess] = useState(false);

  // Draft Payment States
  const [showDraftPaymentGateway, setShowDraftPaymentGateway] = useState(false);
  const [draftPaymentProperty, setDraftPaymentProperty] = useState(null);
  const [draftPaymentSubmitting, setDraftPaymentSubmitting] = useState(false);
  const [draftPaymentSuccess, setDraftPaymentSuccess] = useState(false);
  const [draftPaymentStep, setDraftPaymentStep] = useState(2);
  const [draftPaymentMethod, setDraftPaymentMethod] = useState('Online');
  const [draftBankSubmitOption, setDraftBankSubmitOption] = useState('upload');

  const handleOpenDraftPayment = (property) => {
    setDraftPaymentProperty(property);
    setDraftPaymentStep(2);
    setDraftPaymentMethod('Online');
    setDraftBankSubmitOption('upload');
    setShowDraftPaymentGateway(true);
  };

  const handleOpenExtraCalls = (property) => {
    setExtraCallsProperty(property);
    setExtraCallsCount(40);
    setExtraCallsPrice(4000);
    setExtraCallsPaymentStep(2);
    setExtraCallsPaymentMethod('Online');
    setExtraCallsBankSubmitOption('upload');
    setExtraCallsSubmitting(false);
    setExtraCallsSuccess(false);
    setShowExtraCallsWindow(true);
    setShowExtraCallsGateway(false);
  };

  const handleSubmitExtraCallsPayment = async (method, status, transactionId, totalPrice, packageName, receiptUrl) => {
    setExtraCallsSubmitting(true);
    try {
      const extraCallsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments/extra-calls'
        : 'https://primeventra-vrmv.vercel.app/api/payments/extra-calls';

      const response = await fetch(extraCallsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: extraCallsProperty.id,
          submittedBy: user.username || user.email || user.mobile || 'Guest',
          email: user.email || '',
          paymentMethod: method,
          paymentStatus: status,
          transactionId,
          packageName,
          packagePrice: totalPrice,
          receiptUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit payment. Status: ${response.status}`);
      }

      setExtraCallsSuccess(true);

      // Re-fetch listing data and payments to refresh the profile UI
      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments'
        : 'https://primeventra-vrmv.vercel.app/api/payments';

      const fetchListings = fetch(API_URL).then(res => res.json());
      const fetchPayments = fetch(paymentsUrl).then(res => res.json()).catch(() => []);

      Promise.all([fetchListings, fetchPayments]).then(([listingsData, paymentsData]) => {
        setProperties(listingsData || []);
        setPayments(paymentsData || []);
      });

    } catch (err) {
      console.error(err);
      alert(`Error submitting extra calls payment: ${err.message}`);
    } finally {
      setExtraCallsSubmitting(false);
    }
  };

  const parsePropertyDescription = (desc) => {
    if (!desc) return {};
    const details = {};
    const separator = '--- Property & Contact Details ---';
    let metadataBlock = desc;
    if (desc.includes(separator)) {
      metadataBlock = desc.split(separator)[1] || '';
    }
    const lines = metadataBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.substring(0, idx).trim().toLowerCase();
        const val = line.substring(idx + 1).trim();
        if (key === 'contact person') {
          const names = val.split(' ');
          details.firstName = names[0] || '';
          details.lastName = names.slice(1).join(' ') || '';
        } else if (key === 'phone') {
          details.phone = val.replace(/^\+94\s*/, ''); // strip dial code since forms append it
        } else if (key === 'whatsapp') {
          details.whatsapp = val.replace(/^\+94\s*/, '');
        } else if (key === 'email') {
          details.email = val;
        }
      }
    });
    return details;
  };

  const handleSubmitDraftPayment = async (method, status, transactionId = null, packagePrice = null, packageName = null, receiptUrl = null) => {
    setDraftPaymentSubmitting(true);
    try {
      const email = user.email || '';

      const draftPayUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://localhost:5000/api/drafts/${draftPaymentProperty.id}/pay`
        : `https://primeventra-vrmv.vercel.app/api/drafts/${draftPaymentProperty.id}/pay`;

      const response = await fetch(draftPayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packagePrice,
          packageName,
          email,
          paymentMethod: method,
          paymentStatus: status,
          receiptUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit payment. Status: ${response.status}`);
      }

      setDraftPaymentSuccess(true);

      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments'
        : 'https://primeventra-vrmv.vercel.app/api/payments';

      const fetchListings = fetch(API_URL).then(res => res.json());
      const fetchPayments = fetch(paymentsUrl).then(res => res.json()).catch(() => []);

      const [listingsData, paymentsData] = await Promise.all([fetchListings, fetchPayments]);
      setProperties(listingsData || []);
      setPayments(paymentsData || []);

      setTimeout(() => {
        setShowDraftPaymentGateway(false);
        setDraftPaymentSuccess(false);
        setDraftPaymentProperty(null);
      }, 1500);

    } catch (err) {
      console.error(err);
      alert(`Error submitting payment: ${err.message}`);
    } finally {
      setDraftPaymentSubmitting(false);
    }
  };

  const initializeEditForm = () => {
    if (user) {
      let countryIso = 'lk';
      let localNumber = user.mobile || '';
      
      if (user.mobile && user.mobile.startsWith('+')) {
        const cleanedMobile = user.mobile.replace(/\s+/g, '');
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
        const matched = sortedCodes.find(c => cleanedMobile.startsWith(c.code));
        if (matched) {
          countryIso = matched.iso;
          localNumber = cleanedMobile.substring(matched.code.length);
        }
      }
      
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        mobile: localNumber,
        email: user.email || ''
      });
      setPhoneCountryCode(countryIso);
      setAvatarPreview(user.avatar_url || '');
    }
  };

  const handleOpenEditModal = () => {
    initializeEditForm();
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (user) {
      let countryIso = 'lk';
      let localNumber = user.mobile || '';
      
      if (user.mobile && user.mobile.startsWith('+')) {
        const cleanedMobile = user.mobile.replace(/\s+/g, '');
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
        const matched = sortedCodes.find(c => cleanedMobile.startsWith(c.code));
        if (matched) {
          countryIso = matched.iso;
          localNumber = cleanedMobile.substring(matched.code.length);
        }
      }
      
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        mobile: localNumber,
        email: user.email || ''
      });
      setPhoneCountryCode(countryIso);
      setAvatarPreview(user.avatar_url || '');
    }
  }, [user, isEditModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const activeDialCode = COUNTRY_CODES.find(c => c.iso === phoneCountryCode)?.code || '+94';
    if (!validatePhoneNumber(formData.mobile, phoneCountryCode)) {
      alert(`Please enter a valid mobile number belonging to the selected country (${activeDialCode}).`);
      return;
    }

    setUpdating(true);

    try {
      let finalAvatarUrl = user.avatar_url;

      // 1. Upload photo if a new file is chosen
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      }

      // 2. Call PUT /api/users/:id endpoint on backend
      const updateUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://localhost:5000/api/users/${user.id}`
        : `https://primeventra-vrmv.vercel.app/api/users/${user.id}`;

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile: `${activeDialCode} ${formData.mobile.trim()}`,
          email: formData.email,
          avatar_url: finalAvatarUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update profile. Status: ${response.status}`);
      }

      const resData = await response.json();
      
      // 3. Update localStorage and component state
      const updatedUser = {
        ...user,
        first_name: resData.user.first_name,
        last_name: resData.user.last_name,
        mobile: resData.user.mobile,
        email: resData.user.email,
        avatar_url: resData.user.avatar_url
      };

      sessionStorage.setItem('portalUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('portalUserUpdated'));
      setIsEditModalOpen(false);
      setActiveTab('my-profile');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    // Retrieve logged-in portal user
    const storedUser = sessionStorage.getItem('portalUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:5000/api/payments'
      : 'https://primeventra-vrmv.vercel.app/api/payments';

     const soldPropertiesUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
       ? 'http://localhost:5000/api/sold-properties'
       : 'https://primeventra-vrmv.vercel.app/api/sold-properties';
 
     const draftsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
       ? `http://localhost:5000/api/drafts/user/${user.username}`
       : `https://primeventra-vrmv.vercel.app/api/drafts/user/${user.username}`;
 
     const fetchListings = fetch(API_URL).then(res => {
       if (!res.ok) throw new Error('Failed to fetch listings');
       return res.json();
     });
 
     const fetchPayments = fetch(paymentsUrl).then(res => {
       if (!res.ok) throw new Error('Failed to fetch payments');
       return res.json();
     }).catch(err => {
       console.warn("Failed to fetch payments for profile:", err);
       return [];
     });
 
     const fetchSoldProperties = fetch(soldPropertiesUrl).then(res => {
       if (!res.ok) throw new Error('Failed to fetch sold properties');
       return res.json();
     }).catch(err => {
       console.warn("Failed to fetch sold properties for profile:", err);
       return [];
     });
 
     const fetchDrafts = fetch(draftsUrl).then(res => {
       if (!res.ok) throw new Error('Failed to fetch drafts');
       return res.json();
     }).catch(err => {
       console.warn("Failed to fetch drafts for profile:", err);
       return [];
     });
 
     Promise.all([fetchListings, fetchPayments, fetchSoldProperties, fetchDrafts])
       .then(([listingsData, paymentsData, soldData, draftsData]) => {
         setProperties(listingsData || []);
         setPayments(paymentsData || []);
         setSoldProperties(soldData || []);
         setDrafts(draftsData || []);
         setLoading(false);
       })
       .catch(err => {
         console.error("Error loading profile data:", err);
         setLoading(false);
       });
   }, [user]);

  const handleLogout = () => {
    sessionStorage.removeItem('portalUser');
    navigate('/login');
  };

  const extractMatch = (desc, prefix, defaultVal = 'N/A') => {
    if (!desc) return defaultVal;
    const safePrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${safePrefix}\\s*(.+)`, 'i');
    const match = desc.match(regex);
    return match ? match[1].trim() : defaultVal;
  };

  const getPaymentDetails = (payment) => {
    if (payment.package_price !== undefined && payment.package_price !== null) {
      return {
        amount: Number(payment.package_price),
        packageName: payment.package_name || 'Standard Package'
      };
    }
    const listing = properties.find(p => p.id == payment.listing_id);
    if (listing && listing.description) {
      const priceMatch = listing.description.match(/Listing Fee:\s*LKR\s*([\d,]+)/i);
      const nameMatch = listing.description.match(/Package Chosen:\s*(.+)/i);
      if (priceMatch || nameMatch) {
        return {
          amount: priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 5500,
          packageName: nameMatch ? nameMatch[1].trim() : 'Standard Package'
        };
      }
    }
    
    // Fallback logic by inspecting package name string
    const pkgName = (payment.package_name || '').toLowerCase();
    if (pkgName.includes('30,000') || pkgName.includes('30000') || pkgName.includes('direct calls')) {
      return { amount: 30000, packageName: 'Super Premium Package' };
    }
    if (pkgName.includes('9,000') || pkgName.includes('9000') || pkgName.includes('premium')) {
      return { amount: 9000, packageName: 'Premium Package' };
    }
    if (pkgName.includes('5,500') || pkgName.includes('5500') || pkgName.includes('standard')) {
      return { amount: 5500, packageName: 'Standard Package' };
    }
    
    // Check if listing price can be used if it matches package prices
    if (payment.listing_price) {
      const lPrice = Number(payment.listing_price);
      if ([2000, 5500, 9000, 30000].includes(lPrice)) {
        return { amount: lPrice, packageName: payment.package_name || 'Listing Package' };
      }
    }
    
    return { amount: 5500, packageName: 'Standard Package' };
  };

  const handleDownloadReceipt = (payment) => {
    const listing = properties.find(p => p.id == payment.listing_id);
    const desc = listing ? listing.description : '';
    const details = getPaymentDetails(payment);
    
    const contactName = extractMatch(desc, 'Contact Person:', `${user.first_name ? user.first_name + ' ' + user.last_name : user.username}`);
    const phone = extractMatch(desc, 'Phone:', 'N/A');
    const whatsapp = extractMatch(desc, 'WhatsApp:', 'N/A');
    const districtName = listing ? listing.district : 'N/A';
    const cityName = listing ? listing.city : 'N/A';
    
    const dateStr = payment.created_at ? new Date(payment.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    const timeStr = payment.created_at ? new Date(payment.created_at).toLocaleTimeString() : new Date().toLocaleTimeString();

    const receiptId = `REC-${payment.id}`;

    const txnMatch = desc ? desc.match(/Transaction ID:\s*(\S+)/) : null;
    const transactionId = txnMatch ? txnMatch[1] : (payment.transaction_id || 'N/A');

    const generatePdf = (imgElement) => {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [26, 115, 232];  // #1a73e8 (Premium blue)
      const textColor = [26, 26, 26];       // #1a1a1a (Dark charcoal)
      const lightGray = [245, 247, 250];    // #f5f7fa
      const gridBorder = [220, 225, 230];   // Light grey border
      
      // Solid premium blue header box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]); 
      doc.rect(20, 12, 170, 22, 'F');
      
      // Render brand logo on the left inside the box
      if (imgElement) {
        doc.addImage(imgElement, 'PNG', 25, 15, 38, 16);
      }
      
      // PAYMENT RECEIPT text on the right inside the box (WHITE)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("PAYMENT RECEIPT", 183, 25.5, { align: 'right' });
      
      // Horizontal separator line (below header box)
      doc.setDrawColor(gridBorder[0], gridBorder[1], gridBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 39, 190, 39);
      
      // Meta Information Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, 43, 170, 36, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      // Labels
      doc.text("Receipt ID:", 25, 49);
      doc.text("Property ID:", 25, 55);
      doc.text("Property Name:", 25, 61);
      doc.text("Payment Date:", 25, 67);
      doc.text("Payment Time:", 25, 73);
      
      doc.text("Payment Method:", 110, 49);
      doc.text("Status:", 110, 55);
      doc.text("Paid Value:", 110, 61);
      doc.text("Selected Package:", 110, 67);
      
      // Values
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(receiptId, 55, 49);
      doc.text(payment.listing_id ? 'P' + String(payment.listing_id).padStart(3, '0') : 'N/A', 55, 55);
      
      const title = payment.listing_title || (listing ? listing.title || listing.name : 'Property Listing');
      const displayTitle = title.length > 28 ? title.substring(0, 25) + '...' : title;
      doc.text(displayTitle, 55, 61);
      
      doc.text(dateStr, 55, 67);
      doc.text(timeStr, 55, 73);
      
      let methodText = payment.payment_method || 'Bank Transfer';
      if (methodText === 'Online Payment' || methodText === 'Online Card Payment' || methodText === 'card payments') {
        methodText = 'card payments';
      }
      doc.text(methodText, 140, 49);
      
      let statusText = (payment.payment_status || 'Approved').toUpperCase();
      if (methodText === 'card payments') {
        statusText = 'COMPLETED';
      }
      if (statusText === 'APPROVED' || statusText === 'COMPLETED' || statusText === 'SUCCESS') {
        doc.setTextColor(34, 197, 94); // Green
      } else if (statusText === 'IN REVIEW') {
        doc.setTextColor(26, 115, 232); // Blue
      } else if (statusText === 'PENDING') {
        doc.setTextColor(234, 179, 8); // Orange/Yellow
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(statusText, 140, 55);
      
      const amountVal = details.amount;
      const formattedAmount = `LKR ${Number(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(formattedAmount, 140, 61);
      
      doc.setFont('helvetica', 'bold');
      doc.text(details.packageName, 140, 67);
      
      // Customer Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CUSTOMER DETAILS", 20, 86);
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 88, 190, 88);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Client Name:", 20, 95);
      doc.text("Email Address:", 20, 101);
      doc.text("Phone Number:", 110, 95);
      doc.text("WhatsApp:", 110, 101);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(contactName, 45, 95);
      doc.text(payment.email || user.email || 'N/A', 45, 101);
      doc.text(phone, 135, 95);
      doc.text(whatsapp, 135, 101);
      
      // Payment Breakdown (Table-like layout)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("LISTING & PAYMENT SUMMARY", 20, 115);
      
      // Draw Table Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 118, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Description", 24, 123.5);
      doc.text("Qty", 125, 123.5, { align: 'center' });
      doc.text("Total Price", 186, 123.5, { align: 'right' });
      
      // Row Item
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const type = payment.listing_type || (listing ? listing.type : '');
      const city = cityName !== 'N/A' ? cityName : '';
      const district = districtName !== 'N/A' ? districtName : '';
      const locationPart = [city, district].filter(Boolean).join(', ');
      
      const descText = `Submission of Property Listing: "${title}"` + (type ? ` (${type})` : '') + `\nPackage: ${details.packageName}` + (locationPart ? ` - ${locationPart}` : '');
      const wrappedDesc = doc.splitTextToSize(descText, 95);
      
      // Row heights & values
      const startY = 130;
      doc.text(wrappedDesc, 24, startY);
      
      doc.text("1", 125, startY, { align: 'center' });
      doc.text(formattedAmount, 186, startY, { align: 'right' });
      
      const endRowY = startY + (wrappedDesc.length * 4.5);
      
      // Draw line under table row
      doc.setDrawColor(gridBorder[0], gridBorder[1], gridBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(20, endRowY, 190, endRowY);
      
      // Subtotal & Total
      const totalY = endRowY + 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text("Subtotal:", 145, totalY, { align: 'right' });
      doc.text(formattedAmount, 186, totalY, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Amount Paid:", 145, totalY + 6, { align: 'right' });
      doc.text(formattedAmount, 186, totalY + 6, { align: 'right' });
      
      // Draw double line under Total
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(145, totalY + 8.5, 190, totalY + 8.5);
      doc.line(145, totalY + 9.5, 190, totalY + 9.5);
      
      // Terms / Info Section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Information & Terms:", 20, 205);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      const termsText = [
        "1. This is a computer-generated receipt and does not require a physical signature.",
        "2. The property listing will be reviewed and published upon verifying the submission contents.",
        "3. For enquiries, contact us at payments@primeventra.com or call/WhatsApp +94 71 649 4884."
      ];
      doc.text(termsText, 20, 210);
      
      // Footer
      doc.setDrawColor(gridBorder[0], gridBorder[1], gridBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 260, 190, 260);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Thank you for choosing Primeventra!", 105, 267, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text("Primeventra Real Estate Portal • Colombo, Sri Lanka • www.primeventra.com", 105, 272, { align: 'center' });
      
      // Save
      doc.save(`receipt_${receiptId}.pdf`);
    };

    // Load logo image dynamically
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      generatePdf(img);
    };
    img.onerror = () => {
      console.warn("Could not load logo image for PDF receipt, generating without logo.");
      generatePdf(null);
    };
  };

  if (!user) return null;

  // Filter payments based on username/email/mobile
  const myPayments = payments.filter(p => 
    (user.username && p.username === user.username) || 
    (user.email && p.username === user.email) || 
    (user.mobile && p.username === user.mobile)
  );

  // Filter listings based on "Submitted By: <identifier>"
  const mySubmissions = properties.filter(p => {
    return p.description && (
      (user.username && p.description.includes(`Submitted By: ${user.username}`)) ||
      (user.email && p.description.includes(`Submitted By: ${user.email}`)) ||
      (user.mobile && p.description.includes(`Submitted By: ${user.mobile}`))
    );
  });

  // 1. My approved listings (not pending, not sold, not draft)
  const myApprovedListings = mySubmissions.filter(p => {
    const isPending = p.description && p.description.includes('Status: Pending');
    const isDraft = p.description && p.description.includes('Status: Draft');
    const isSold = p.description && p.description.includes('Status: Sold');
    const isApproved = p.description && p.description.includes('Status: Approved');
    return (isApproved || (!isPending && !isDraft)) && !isSold;
  });

  // 2. Pending approvals (contains Pending status)
  const myPendingListings = mySubmissions.filter(p => {
    return p.description && p.description.includes('Status: Pending');
  });

  // 2.5 My draft listings (mapped from drafts state)
  const myDraftListings = drafts.map(d => ({
    id: d.property_id,
    title: d.title,
    price: d.price,
    type: d.type,
    description: d.description || '',
    district: d.district,
    city: d.city,
    photos: d.photos || [],
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    size_sqft: d.size_sqft,
    land_size_perches: d.land_size_perches,
    land_type: d.land_type,
    created_at: d.created_at
  }));

  // Sort payments by date
  const mergedPayments = [...myPayments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 3. My sold properties
  const mySoldListings = [
    ...soldProperties.filter(p => p.description && (
      (user.username && p.description.includes(`Submitted By: ${user.username}`)) ||
      (user.email && p.description.includes(`Submitted By: ${user.email}`)) ||
      (user.mobile && p.description.includes(`Submitted By: ${user.mobile}`))
    )),
    ...mySubmissions.filter(p => p.description && p.description.includes('Status: Sold'))
  ];

  // 4. My liked properties
  const likedKey = user.username || user.email || user.mobile || 'guest';
  const likedIds = JSON.parse(localStorage.getItem(`liked_properties_${likedKey}`) || '[]');
  const myLikedListings = properties.filter(p => likedIds.includes(p.id));

  // Determine which properties to render based on activeTab
  const getRenderedProperties = () => {
    if (activeTab === 'listings') return myApprovedListings;
    if (activeTab === 'pending') return myPendingListings;
    if (activeTab === 'sold') return mySoldListings;
    if (activeTab === 'liked') return myLikedListings;
    if (activeTab === 'drafts') return myDraftListings;
    return [];
  };

  const renderedList = getRenderedProperties();

  // Helper formatting functions
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseStatus = (desc) => {
    if (!desc) return 'Approved';
    if (desc.includes('Status: Pending')) return 'Pending Approval';
    if (desc.includes('Status: Sold')) return 'Sold';
    return 'Approved';
  };

  return (
    <div className="profile-page-wrapper">
      <main className="profile-container">
        
        {/* Profile Sidebar & Content Layout Wrapper */}
        <div className="profile-layout-wrapper" style={{ marginTop: '2.5rem' }}>
          <aside className="profile-sidebar">
            <div className="profile-tabs-container">
              {/* Listings Category Header */}
              <div style={{ padding: '0.75rem 0.5rem 0.25rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>Listings</div>
              <button 
                className={`profile-tab ${activeTab === 'listings' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                <span className="material-symbols-outlined">format_list_bulleted</span> My Listings ({myApprovedListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'pending' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <span className="material-symbols-outlined">hourglass_empty</span> Pending Approvals ({myPendingListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'drafts' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('drafts')}
              >
                <span className="material-symbols-outlined">edit</span> My Drafts ({myDraftListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'sold' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('sold')}
              >
                <span className="material-symbols-outlined">sell</span> Sold Properties ({mySoldListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'liked' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('liked')}
              >
                <span className="material-symbols-outlined">favorite_border</span> Liked Properties ({myLikedListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'payments' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <span className="material-symbols-outlined">payments</span> My Payments ({mergedPayments.length})
              </button>

              {/* Profile Category Header */}
              <div style={{ padding: '1.25rem 0.5rem 0.25rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>Profile</div>
              <button 
                className={`profile-tab ${activeTab === 'my-profile' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('my-profile')}
              >
                <span className="material-symbols-outlined">person</span> My Profile
              </button>
              <button 
                className={`profile-tab ${activeTab === 'edit-profile' ? 'profile-tab--active' : ''}`}
                onClick={() => {
                  initializeEditForm();
                  setActiveTab('edit-profile');
                }}
              >
                <span className="material-symbols-outlined">manage_accounts</span> Edit Profile
              </button>
              <button 
                className="profile-tab"
                onClick={handleLogout}
                style={{ color: '#ba1a1a' }}
              >
                <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>logout</span> Logout
              </button>
            </div>
          </aside>

          {/* Right Side Column containing User Details Header and Tab Content */}
          <div className="profile-content-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
            
            {/* Profile Card / Header (Aligned in the right side at the top of description/listings boxes) */}
            <section className="profile-card-header glass-effect" style={{ marginBottom: 0, paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url || null} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.first_name || user.username || user.email || user.mobile || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="profile-info">
                  <h1 className="profile-username" style={{ margin: 0 }}>
                    {user.first_name || user.last_name 
                      ? [user.first_name, user.last_name].filter(Boolean).join(' ') 
                      : (user.username || user.email || user.mobile)}
                  </h1>
                </div>
              </div>
              
              {/* Breadcrumb Path at the bottom of the bar */}
              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.15)', 
                paddingTop: '0.75rem', 
                fontSize: '0.85rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span>{user.username || 'user'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: 0.7 }}>chevron_right</span>
                <span>
                  {['listings', 'pending', 'drafts', 'sold', 'liked', 'payments'].includes(activeTab) ? 'listings' : 'profile'}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: 0.7 }}>chevron_right</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  {activeTab === 'listings' && 'my listings'}
                  {activeTab === 'pending' && 'pending approvals'}
                  {activeTab === 'drafts' && 'my drafts'}
                  {activeTab === 'sold' && 'sold properties'}
                  {activeTab === 'liked' && 'liked properties'}
                  {activeTab === 'payments' && 'my payments'}
                  {activeTab === 'my-profile' && 'my profile'}
                  {activeTab === 'edit-profile' && 'edit profile'}
                </span>
              </div>
            </section>

            {/* Dynamic Content Pane (The description/listings boxes) */}
            <div className="profile-tab-content" style={{ width: '100%' }}>
              {loading ? (
                <div className="profile-status-message">
                  <p>Loading activities...</p>
                </div>
              ) : activeTab === 'my-profile' ? (
                /* My Profile Tab Content */
                <div className="profile-details-card" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)' }}>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>My Profile</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0, width: '100px', height: '100px', fontSize: '2.5rem' }}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (user.first_name || user.username || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                          {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Member since {formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1rem', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>First Name</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.first_name || '-'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Last Name</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.last_name || '-'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Mobile Number</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.mobile || '-'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Email Address</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'edit-profile' ? (
                /* Edit Profile Tab Content */
                <div className="profile-details-card" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)' }}>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Edit Profile Details</h3>
                  <form onSubmit={handleProfileUpdate} className="profile-modal-form" style={{ maxWidth: '600px' }}>
                    {/* Profile Photo Upload */}
                    <div className="profile-photo-upload-section" style={{ marginBottom: '1.5rem' }}>
                      <div className="profile-modal-avatar-preview">
                        {avatarPreview ? (
                          <img src={avatarPreview || null} alt="Avatar Preview" />
                        ) : (
                          (formData.firstName || user.username || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <label className="profile-photo-upload-label">
                        <span className="material-symbols-outlined">cloud_upload</span> Choose Profile Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>

                    <div className="profile-modal-grid">
                      <div className="profile-modal-group">
                        <label className="profile-modal-label">First Name *</label>
                        <input 
                          type="text" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleInputChange} 
                          placeholder="Enter first name"
                          className="profile-modal-control"
                          required
                        />
                      </div>
                      <div className="profile-modal-group">
                        <label className="profile-modal-label">Last Name *</label>
                        <input 
                          type="text" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleInputChange} 
                          placeholder="Enter last name"
                          className="profile-modal-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="profile-modal-group">
                      <label className="profile-modal-label">Mobile Number *</label>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        border: isPhoneFocused ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-outline-variant)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '0 10px', 
                        backgroundColor: 'var(--color-surface)', 
                        height: '46px',
                        transition: 'border-color var(--transition-fast)'
                      }}>
                        <CountrySelector value={phoneCountryCode} onChange={setPhoneCountryCode} />
                        <input 
                          type="tel" 
                          name="mobile" 
                          value={formData.mobile} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 771234567"
                          style={{ 
                            border: 'none', 
                            background: 'transparent', 
                            outline: 'none', 
                            color: 'var(--color-on-surface)', 
                            width: '100%', 
                            height: '100%', 
                            fontSize: 'var(--text-base)', 
                            fontFamily: 'var(--font-body)',
                            paddingLeft: '4px'
                          }}
                          onFocus={() => setIsPhoneFocused(true)}
                          onBlur={() => setIsPhoneFocused(false)}
                          required
                        />
                      </div>
                    </div>

                    <div className="profile-modal-group">
                      <label className="profile-modal-label">Email Address *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="Enter email address"
                        className="profile-modal-control"
                        required
                      />
                    </div>

                    <div className="profile-modal-actions" style={{ marginTop: '2rem' }}>
                      <button 
                        type="submit" 
                        className="profile-modal-btn profile-modal-btn--save" 
                        disabled={updating}
                        style={{ width: '100%', maxWidth: '200px' }}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : activeTab === 'payments' ? (
                <div className="profile-payments-section">
              <h3 className="profile-section-title" style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>My Payments</h3>
              {mergedPayments.length === 0 ? (
                <div className="profile-empty-state" style={{ margin: '0 auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-text-muted)' }}>
                    payments
                  </span>
                  <h3>No payments recorded</h3>
                  <p>You haven't made any listing payments yet.</p>
                  <Link to="/list" className="profile-action-btn">
                    Submit Listing
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
                  <table className="profile-payments-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-outline-variant)' }}>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Property ID</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Property Title</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Method</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Amount</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Status</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Date</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergedPayments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                          <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {p.listing_id ? 'P' + String(p.listing_id).padStart(3, '0') : 'N/A'}
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{p.listing_title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Type: {p.listing_type}</div>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '500' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-primary-light)' }}>
                                {p.payment_method === 'Online Payment' || p.payment_method === 'card payments' ? 'credit_card' : 'account_balance'}
                              </span>
                              {p.payment_method === 'Online Payment' || p.payment_method === 'card payments' ? 'card payments' : p.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: 'bold' }}>
                            LKR {Number(getPaymentDetails(p).amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '14px 10px' }}>
                            <span style={{
                              backgroundColor: (p.payment_method === 'Online Payment' || p.payment_method === 'card payments' || p.payment_status === 'Completed') ? '#e6f4ea' : (p.payment_status === 'In Review' ? '#e8f0fe' : '#fef7e0'),
                              color: (p.payment_method === 'Online Payment' || p.payment_method === 'card payments' || p.payment_status === 'Completed') ? '#137333' : (p.payment_status === 'In Review' ? '#1a73e8' : '#b06000'),
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'inline-block'
                            }}>
                              {p.payment_method === 'Online Payment' || p.payment_method === 'card payments' ? 'Completed' : p.payment_status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                            {p.payment_status === 'Completed' || p.payment_method === 'Online Payment' || p.payment_method === 'card payments' ? (
                              <button
                                onClick={() => handleDownloadReceipt(p)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  border: '1px solid var(--color-primary-light)',
                                  borderRadius: '4px',
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-primary)',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                title="Download Receipt"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                                Receipt
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>N/A (Draft/Unpaid)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : renderedList.length === 0 ? (
            <div className="profile-empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-text-muted)' }}>
                {activeTab === 'listings' ? 'home_work' : activeTab === 'pending' ? 'hourglass_empty' : activeTab === 'drafts' ? 'edit' : activeTab === 'sold' ? 'assignment_turned_in' : 'favorite_border'}
              </span>
              <h3>No properties found</h3>
              <p>
                {activeTab === 'listings' && "You don't have any approved listings."}
                {activeTab === 'pending' && "You don't have any pending approvals."}
                {activeTab === 'drafts' && "You don't have any saved drafts."}
                {activeTab === 'sold' && "No properties marked as sold yet."}
                {activeTab === 'liked' && "Properties you like will appear here."}
              </p>
              {(activeTab === 'listings' || activeTab === 'pending' || activeTab === 'drafts') && (
                <Link to="/list" className="profile-action-btn">
                  Submit Listing
                </Link>
              )}
              {activeTab === 'liked' && (
                <Link to="/listing" className="profile-action-btn">
                  Explore Catalog
                </Link>
              )}
            </div>
          ) : (
            <div className="profile-grid">
              {renderedList.map(property => {
                const status = parseStatus(property.description);
                return (
                  <article key={property.id} className="profile-property-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/listing/${property.id}`} state={{ property }} className="profile-property-card__link" style={{ flexGrow: 1 }}>
                      <div className="profile-property-card__img-container">
                        <img 
                          src={property.photos && property.photos.length > 0 ? property.photos[0] : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"} 
                          alt={property.title} 
                          className="profile-property-card__img"
                        />
                        <div className="profile-property-card__badge-category">{property.type}</div>
                        {(activeTab === 'listings' || activeTab === 'pending' || activeTab === 'drafts') && (
                          <div className={`profile-property-card__status-badge profile-property-card__status-badge--${status.replace(' ', '-').toLowerCase()}`}>
                            {status}
                          </div>
                        )}
                      </div>
                      <div className="profile-property-card__info">
                        <h4 className="profile-property-card__title">{property.title}</h4>
                        <div className="profile-property-card__price">Rs. {Number(property.price).toLocaleString()}</div>
                        <div className="profile-property-card__location">
                          <span className="material-symbols-outlined">location_on</span>
                          {property.city}, {property.district}
                        </div>
                      </div>
                    </Link>
                    {activeTab === 'drafts' && (
                      <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', marginTop: '-0.5rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenDraftPayment(property);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>credit_card</span>
                          Continue to Payment
                        </button>
                      </div>
                    )}
                    {activeTab === 'listings' && (
                      <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', marginTop: '-0.5rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenExtraCalls(property);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            border: '1.5px solid var(--color-primary-light)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_call</span>
                          Add Extra Calls
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card">
            <button className="profile-modal-close-btn" onClick={() => setIsEditModalOpen(false)} title="Close window">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="profile-modal-title">Edit Profile Details</h2>
            <form onSubmit={handleProfileUpdate} className="profile-modal-form">
              
              {/* Profile Photo Upload */}
              <div className="profile-photo-upload-section">
                <div className="profile-modal-avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview || null} alt="Avatar Preview" />
                  ) : (
                    (formData.firstName || user.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <label className="profile-photo-upload-label">
                  <span className="material-symbols-outlined">cloud_upload</span> Choose Profile Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>

              <div className="profile-modal-grid">
                <div className="profile-modal-group">
                  <label className="profile-modal-label">First Name *</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    placeholder="Enter first name"
                    className="profile-modal-control"
                    required
                  />
                </div>
                <div className="profile-modal-group">
                  <label className="profile-modal-label">Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    placeholder="Enter last name"
                    className="profile-modal-control"
                    required
                  />
                </div>
              </div>

              <div className="profile-modal-group">
                <label className="profile-modal-label">Mobile Number *</label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: isPhoneFocused ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-outline-variant)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0 10px', 
                  backgroundColor: 'var(--color-surface)', 
                  height: '46px',
                  transition: 'border-color var(--transition-fast)'
                }}>
                  <CountrySelector value={phoneCountryCode} onChange={setPhoneCountryCode} />
                  <input 
                    type="tel" 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 771234567"
                    style={{ 
                      border: 'none', 
                      background: 'transparent', 
                      outline: 'none', 
                      color: 'var(--color-on-surface)', 
                      width: '100%', 
                      height: '100%', 
                      fontSize: 'var(--text-base)', 
                      fontFamily: 'var(--font-body)',
                      paddingLeft: '4px'
                    }}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    required
                  />
                </div>
              </div>

              <div className="profile-modal-group">
                <label className="profile-modal-label">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="Enter email address"
                  className="profile-modal-control"
                  required
                />
              </div>

              <div className="profile-modal-actions">
                <button 
                  type="button" 
                  className="profile-modal-btn profile-modal-btn--cancel" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="profile-modal-btn profile-modal-btn--save" 
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Calls Modal Overlay */}
      {showExtraCallsWindow && (
        <div className="extra-calls-overlay">
          <div className="extra-calls-modal animate-fade-in" style={{ padding: showExtraCallsGateway ? '1rem' : '0' }}>
            <button 
              className="extra-calls-close-btn" 
              onClick={() => setShowExtraCallsWindow(false)}
              title="Close window"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {!showExtraCallsGateway ? (
              <div className="extra-calls-content">
                <h2 className="extra-calls-title">Add Extra Calls</h2>
                <p className="extra-calls-subtitle">
                  Increase inquiry call limit for <strong>{extraCallsProperty?.title}</strong>
                </p>

                <div className="extra-calls-card">
                  <span className="extra-calls-label">Add 40 more calls</span>
                  <div className="extra-calls-counter">
                    <button 
                      type="button" 
                      className="extra-calls-btn-adjust"
                      onClick={() => {
                        const nextCount = Math.max(40, extraCallsCount - 40);
                        setExtraCallsCount(nextCount);
                        setExtraCallsPrice((nextCount / 40) * 4000);
                      }}
                      disabled={extraCallsCount <= 40}
                    >
                      -
                    </button>
                    <span className="extra-calls-value">{extraCallsCount}</span>
                    <button 
                      type="button" 
                      className="extra-calls-btn-adjust"
                      onClick={() => {
                        const nextCount = extraCallsCount + 40;
                        setExtraCallsCount(nextCount);
                        setExtraCallsPrice((nextCount / 40) * 4000);
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div className="extra-calls-price-box">
                    <span className="extra-calls-price-label">Additional Cost</span>
                    <span className="extra-calls-price-value">LKR {extraCallsPrice.toLocaleString()}.00</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button 
                    type="button" 
                    className="profile-modal-btn profile-modal-btn--cancel" 
                    onClick={() => setShowExtraCallsWindow(false)}
                    style={{ padding: '10px 24px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="profile-modal-btn profile-modal-btn--save" 
                    onClick={() => setShowExtraCallsGateway(true)}
                    style={{ padding: '10px 24px' }}
                  >
                    Next <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '4px', verticalAlign: 'middle' }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem 2rem 2.5rem 2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Complete Payment for Extra Calls
                </h3>
                <PaymentGateway
                  propertyType={extraCallsProperty?.type || 'Apartment'}
                  formData={{ title: extraCallsProperty?.title || 'Property' }}
                  onBack={() => setShowExtraCallsGateway(false)}
                  onSubmitListing={handleSubmitExtraCallsPayment}
                  isSubmitting={extraCallsSubmitting}
                  isSuccess={extraCallsSuccess}
                  step={extraCallsPaymentStep}
                  setStep={setExtraCallsPaymentStep}
                  paymentMethod={extraCallsPaymentMethod}
                  setPaymentMethod={setExtraCallsPaymentMethod}
                  bankSubmitOption={extraCallsBankSubmitOption}
                  setBankSubmitOption={setExtraCallsBankSubmitOption}
                  isExtraCallsMode={true}
                  extraCallsCount={extraCallsCount}
                  extraCallsPrice={extraCallsPrice}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draft Payment Modal */}
      {showDraftPaymentGateway && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="profile-modal glass-effect" style={{ maxWidth: '600px', width: '90%', padding: 0, overflow: 'hidden' }}>
            <div className="profile-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Complete Listing Payment</h2>
              <button className="profile-modal-close" onClick={() => setShowDraftPaymentGateway(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1rem 2rem 2.5rem 2rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <PaymentGateway
                propertyType={draftPaymentProperty?.type || 'Apartment'}
                formData={{
                  ...draftPaymentProperty,
                  ...parsePropertyDescription(draftPaymentProperty?.description)
                }}
                onBack={() => setShowDraftPaymentGateway(false)}
                onSubmitListing={handleSubmitDraftPayment}
                isSubmitting={draftPaymentSubmitting}
                isSuccess={draftPaymentSuccess}
                step={draftPaymentStep}
                setStep={setDraftPaymentStep}
                paymentMethod={draftPaymentMethod}
                setPaymentMethod={setDraftPaymentMethod}
                bankSubmitOption={draftBankSubmitOption}
                setBankSubmitOption={setDraftBankSubmitOption}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
