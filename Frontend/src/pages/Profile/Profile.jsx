import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/profile.css';
import { jsPDF } from 'jspdf';
import logo from '../../assets/logo2.png';

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [soldProperties, setSoldProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'pending', 'sold', 'liked', 'payments'
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve logged-in portal user
    const storedUser = localStorage.getItem('portalUser');
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

    Promise.all([fetchListings, fetchPayments, fetchSoldProperties])
      .then(([listingsData, paymentsData, soldData]) => {
        setProperties(listingsData || []);
        setPayments(paymentsData || []);
        setSoldProperties(soldData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading profile data:", err);
        setLoading(false);
      });
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('portalUser');
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
          amount: priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 5000,
          packageName: nameMatch ? nameMatch[1].trim() : 'Standard Package'
        };
      }
    }
    return { amount: 5000, packageName: 'Standard Package' };
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
      const primaryColor = [15, 41, 74];    // #0f294a (Navy blue)
      const textColor = [26, 26, 26];       // #1a1a1a (Dark charcoal)
      const lightGray = [245, 247, 250];    // #f5f7fa
      const gridBorder = [220, 225, 230];   // Light grey border
      
      // Header Section
      if (imgElement) {
        // Render logo larger and clearly visible
        doc.addImage(imgElement, 'PNG', 20, 13, 55, 15);
      }
      
      // Horizontal separator line
      doc.setDrawColor(gridBorder[0], gridBorder[1], gridBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);
      
      // Meta Information Box (expanded to print all details clearly)
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, 37, 170, 36, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      // Labels
      doc.text("Receipt ID:", 25, 43);
      doc.text("Transaction ID:", 25, 49);
      doc.text("Property Name:", 25, 55);
      doc.text("Payment Date:", 25, 61);
      doc.text("Payment Time:", 25, 67);
      
      doc.text("Payment Method:", 110, 43);
      doc.text("Status:", 110, 49);
      doc.text("Paid Value:", 110, 55);
      doc.text("Selected Package:", 110, 61);
      
      // Values
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(receiptId, 55, 43);
      doc.text(transactionId, 55, 49);
      
      const title = payment.listing_title || (listing ? listing.title || listing.name : 'Property Listing');
      const displayTitle = title.length > 28 ? title.substring(0, 25) + '...' : title;
      doc.text(displayTitle, 55, 55);
      
      doc.text(dateStr, 55, 61);
      doc.text(timeStr, 55, 67);
      
      doc.text(payment.payment_method || 'Bank Transfer', 140, 43);
      
      const statusText = (payment.payment_status || 'approved').toUpperCase();
      if (statusText === 'APPROVED' || statusText === 'COMPLETED' || statusText === 'SUCCESS') {
        doc.setTextColor(34, 197, 94); // Green
      } else if (statusText === 'PENDING') {
        doc.setTextColor(234, 179, 8); // Orange/Yellow
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(statusText, 140, 49);
      
      const amountVal = details.amount;
      const formattedAmount = `LKR ${Number(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(formattedAmount, 140, 55);
      
      doc.setFont('helvetica', 'bold');
      doc.text(details.packageName, 140, 61);
      
      // Customer Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CUSTOMER DETAILS", 20, 81);
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 83, 190, 83);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Client Name:", 20, 90);
      doc.text("Email Address:", 20, 96);
      doc.text("Phone Number:", 110, 90);
      doc.text("WhatsApp:", 110, 96);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(contactName, 45, 90);
      doc.text(payment.email || user.email || 'N/A', 45, 96);
      doc.text(phone, 135, 90);
      doc.text(whatsapp, 135, 96);
      
      // Payment Breakdown (Table-like layout)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("LISTING & PAYMENT SUMMARY", 20, 110);
      
      // Draw Table Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 113, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Description", 24, 118.5);
      doc.text("Qty", 125, 118.5, { align: 'center' });
      doc.text("Total Price", 186, 118.5, { align: 'right' });
      
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
      const startY = 125;
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

  // 1. My approved listings (not pending, not sold)
  const myApprovedListings = mySubmissions.filter(p => {
    return (p.description.includes('Status: Approved') || !p.description.includes('Status: Pending')) && !p.description.includes('Status: Sold');
  });

  // 2. Pending approvals (contains Pending status)
  const myPendingListings = mySubmissions.filter(p => {
    return p.description.includes('Status: Pending');
  });

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
        
        {/* Profile Card / Header */}
        <section className="profile-card-header glass-effect">
          <div className="profile-avatar">
            {(user.username || user.email || user.mobile || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-username">{user.username || user.email || user.mobile}</h1>
            {user.email && (
              <p className="profile-email">
                <span className="material-symbols-outlined">mail</span> {user.email}
              </p>
            )}
            {user.mobile && (
              <p className="profile-email">
                <span className="material-symbols-outlined">call</span> {user.mobile}
              </p>
            )}
            <p className="profile-joined">
              <span className="material-symbols-outlined">calendar_today</span> Member since {formatDate(user.created_at)}
            </p>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span> Log Out
          </button>
        </section>

        {/* Profile Sidebar & Content Layout Wrapper */}
        <div className="profile-layout-wrapper">
          <aside className="profile-sidebar">
            <div className="profile-tabs-container">
              <button 
                className={`profile-tab ${activeTab === 'listings' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                <span className="material-symbols-outlined">home</span> My Listings ({myApprovedListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'pending' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <span className="material-symbols-outlined">hourglass_empty</span> Pending Approvals ({myPendingListings.length})
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
                <span className="material-symbols-outlined">favorite</span> Liked Properties ({myLikedListings.length})
              </button>
              <button 
                className={`profile-tab ${activeTab === 'payments' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <span className="material-symbols-outlined">payments</span> My Payments ({myPayments.length})
              </button>
            </div>
          </aside>

          <div className="profile-tab-content">
          {loading ? (
            <div className="profile-status-message">
              <p>Loading activities...</p>
            </div>
          ) : activeTab === 'payments' ? (
            <div className="profile-payments-section">
              <h3 className="profile-section-title" style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>My Payments</h3>
              {myPayments.length === 0 ? (
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
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Payment ID</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Property Title</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Method</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Amount</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Status</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>Date</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                          <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {p.id ? (String(p.id).startsWith('pay_') ? p.id : `pay_${p.id}`) : 'N/A'}
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{p.listing_title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Type: {p.listing_type}</div>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: '500' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-primary-light)' }}>
                                {p.payment_method === 'Online Payment' ? 'credit_card' : 'account_balance'}
                              </span>
                              {p.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: 'bold' }}>
                            LKR {Number(getPaymentDetails(p).amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '14px 10px' }}>
                            <span style={{
                              backgroundColor: p.payment_status === 'Completed' ? '#e6f4ea' : '#fef7e0',
                              color: p.payment_status === 'Completed' ? '#137333' : '#b06000',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'inline-block'
                            }}>
                              {p.payment_status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '14px 10px', textAlign: 'center' }}>
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
                {activeTab === 'listings' ? 'home_work' : activeTab === 'pending' ? 'hourglass_empty' : activeTab === 'sold' ? 'assignment_turned_in' : 'favorite_border'}
              </span>
              <h3>No properties found</h3>
              <p>
                {activeTab === 'listings' && "You don't have any approved listings."}
                {activeTab === 'pending' && "You don't have any pending approvals."}
                {activeTab === 'sold' && "No properties marked as sold yet."}
                {activeTab === 'liked' && "Properties you like will appear here."}
              </p>
              {(activeTab === 'listings' || activeTab === 'pending') && (
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
                  <article key={property.id} className="profile-property-card">
                    <Link to={`/listing/${property.id}`} state={{ property }} className="profile-property-card__link">
                      <div className="profile-property-card__img-container">
                        <img 
                          src={property.photos && property.photos.length > 0 ? property.photos[0] : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"} 
                          alt={property.title} 
                          className="profile-property-card__img"
                        />
                        <div className="profile-property-card__badge-category">{property.type}</div>
                        {(activeTab === 'listings' || activeTab === 'pending') && (
                          <div className={`profile-property-card__status-badge profile-property-card__status-badge--${status.replace(' ', '-').toLowerCase()}`}>
                            {status}
                          </div>
                        )}
                      </div>
                      <div className="profile-property-card__info">
                        <div className="profile-property-card__price">Rs. {Number(property.price).toLocaleString()}</div>
                        <h4 className="profile-property-card__title">{property.title}</h4>
                        <div className="profile-property-card__location">
                          <span className="material-symbols-outlined">location_on</span>
                          {property.city}, {property.district}
                        </div>
                        <div className="profile-property-card__specs">
                          {property.bedrooms && <span><span className="material-symbols-outlined">bed</span> {property.bedrooms} Bed</span>}
                          {property.bathrooms && <span><span className="material-symbols-outlined">bathtub</span> {property.bathrooms} Bath</span>}
                          {property.size_sqft && <span><span className="material-symbols-outlined">square_foot</span> {property.size_sqft} sqft</span>}
                          {property.land_size_perches && <span><span className="material-symbols-outlined">terrain</span> {property.land_size_perches} Perch</span>}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      </main>
    </div>
  );
}
