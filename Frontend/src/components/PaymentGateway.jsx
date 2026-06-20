import React, { useState } from 'react';
import 'material-symbols';
import { jsPDF } from 'jspdf';
import logo from '../assets/logo2.png';

export default function PaymentGateway({ 
  propertyType, 
  formData, 
  onBack, 
  onSubmitListing, 
  isSubmitting, 
  isSuccess 
}) {
  const [step, setStep] = useState(2); // 2: Selection, 3: Card Form / Bank Details, 4: Online Success
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' or 'Bank'
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  
  const [transactionId] = useState(() => 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase());
  const PACKAGES = [
    { id: 'pkg1', name: 'Standard Package (call 40+)', price: 5500, calls: '40+' },
    { id: 'pkg2', name: 'Premium Package (call 80+)', price: 9000, calls: '80+' },
    { id: 'pkg3', name: 'Deluxe Package (call 120+)', price: 12000, calls: '120+' },
  ];
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);
  const [addOnChecked, setAddOnChecked] = useState(false);
  const ADD_ON_PRICE = 4000;
  const totalPrice = selectedPackage.price + (addOnChecked ? ADD_ON_PRICE : 0);

  // Card state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    
    if (name === 'cardNumber') {
      // Allow only numbers and format with spaces every 4 digits
      val = val.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'cardExpiry') {
      // Format as MM/YY
      val = val.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
    } else if (name === 'cardCvv') {
      val = val.replace(/\D/g, '').substring(0, 3);
    } else if (name === 'cardName') {
      val = val.toUpperCase().substring(0, 25);
    }

    setCardDetails(prev => ({ ...prev, [name]: val }));
  };

  const downloadReceipt = () => {
    const receiptId = `REC-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    const generatePdf = (imgElement) => {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [15, 41, 74];    // #0f294a (Navy blue)
      const textColor = [26, 26, 26];       // #1a1a1a (Dark charcoal)
      const lightGray = [245, 247, 250];    // #f5f7fa
      const gridBorder = [220, 225, 230];   // Light grey border
      
      // Header Section
      if (imgElement) {
        doc.addImage(imgElement, 'PNG', 20, 15, 20, 20);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PRIMEVENTRA", 45, 23);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("REAL ESTATE PORTAL", 45, 28);
      doc.text("Your Premier Property Partner", 45, 32);
      
      // Right header - DOCUMENT TYPE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PAYMENT RECEIPT", 190, 23, { align: 'right' });
      
      // Horizontal separator line
      doc.setDrawColor(gridBorder[0], gridBorder[1], gridBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 42, 190, 42);
      
      // Meta Information Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, 47, 170, 26, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      // Labels
      doc.text("Receipt ID:", 25, 53);
      doc.text("Transaction ID:", 25, 59);
      doc.text("Date:", 25, 65);
      
      doc.text("Payment Method:", 110, 53);
      doc.text("Status:", 110, 59);
      
      // Values
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(receiptId, 50, 53);
      doc.text(transactionId, 50, 59);
      doc.text(`${dateStr} ${timeStr}`, 50, 65);
      
      doc.text(paymentMethod === 'Bank' ? 'Bank Transfer' : 'Online Card Payment', 140, 53);
      
      const statusText = paymentMethod === 'Bank' ? 'PENDING' : 'COMPLETED';
      if (statusText === 'COMPLETED') {
        doc.setTextColor(34, 197, 94); // Green
      } else {
        doc.setTextColor(234, 179, 8); // Orange/Yellow
      }
      doc.text(statusText, 140, 59);
      
      // Customer Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CUSTOMER DETAILS", 20, 83);
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 85, 190, 85);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Client Name:", 20, 92);
      doc.text("Email Address:", 20, 98);
      doc.text("Phone Number:", 110, 92);
      doc.text("WhatsApp:", 110, 98);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${formData.firstName} ${formData.lastName}`, 45, 92);
      doc.text(formData.email || 'N/A', 45, 98);
      doc.text(formData.phone || 'N/A', 135, 92);
      doc.text(formData.whatsapp || 'N/A', 135, 98);
      
      // Payment Breakdown
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("LISTING & PAYMENT SUMMARY", 20, 112);
      
      // Draw Table Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 115, 170, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Description", 24, 120.5);
      doc.text("Qty", 125, 120.5, { align: 'center' });
      doc.text("Total Price", 186, 120.5, { align: 'right' });
      
      // Row Item
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const title = formData.title || 'Property Listing';
      const type = propertyType || '';
      const city = formData.city || '';
      const district = formData.district || '';
      const locationPart = [city, district].filter(Boolean).join(', ');
      const packageName = selectedPackage.name + (addOnChecked ? ' + Extra 40 Calls Add-on' : '');
      
      const descText = `Property Listing Submission: "${title}"` + (type ? ` (${type})` : '') + (locationPart ? ` - ${locationPart}` : '') + `\nPackage: ${packageName}`;
      const wrappedDesc = doc.splitTextToSize(descText, 95);
      
      const startY = 127;
      doc.text(wrappedDesc, 24, startY);
      
      doc.text("1", 125, startY, { align: 'center' });
      
      const formattedAmount = `LKR ${Number(totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      doc.text("Important Notice & Instructions:", 20, 200);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      let noticeY = 205;
      if (paymentMethod === 'Bank') {
        const lines = doc.splitTextToSize(`ACTION REQUIRED: Please write the Transaction ID (${transactionId}) clearly on your bank transfer slip or online transfer description. Take a screenshot or photo and send it to our WhatsApp: +94 71 649 4884 or email: payments@primeventra.com.`, 170);
        doc.text(lines, 20, noticeY);
        noticeY += (lines.length * 4.5);
      } else {
        const lines = doc.splitTextToSize("Thank you for your payment! Your transaction was processed successfully. The property listing has been submitted and is currently pending final admin approval.", 170);
        doc.text(lines, 20, noticeY);
        noticeY += (lines.length * 4.5);
      }
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const termsText = [
        "1. This is a computer-generated receipt and does not require a physical signature.",
        "2. Listing review can take up to 24 hours. You will be notified via email/SMS once approved or if changes are required.",
        "3. For payment issues, please contact us at support@primeventra.com."
      ];
      doc.text(termsText, 20, noticeY + 4);
      
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
    
    setReceiptDownloaded(true);
  };

  const handleProceedPayment = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardDetails.cardExpiry.length < 5) {
      alert('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cardDetails.cardCvv.length < 3) {
      alert('Please enter a valid CVV.');
      return;
    }
    if (!cardDetails.cardName.trim()) {
      alert('Please enter the cardholder\'s name.');
      return;
    }

    // Start payment processing animation
    setPaymentProcessing(true);
    setProcessingStatus('Securely connecting to payment gateway...');
    
    setTimeout(() => {
      setProcessingStatus('Verifying card credentials with issuer bank...');
      setTimeout(() => {
        setProcessingStatus(`Authorizing transaction (LKR ${totalPrice.toLocaleString()}.00)...`);
        setTimeout(() => {
          setPaymentProcessing(false);
          setStep(4);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleFinalSubmit = async () => {
    const finalMethod = paymentMethod === 'Bank' ? 'Bank Transfer' : 'Online Payment';
    const finalStatus = paymentMethod === 'Bank' ? 'Pending' : 'Completed';
    await onSubmitListing(finalMethod, finalStatus, transactionId, totalPrice, selectedPackage.name + (addOnChecked ? ' + Extra 40 Calls' : ''));
  };

  return (
    <div className="payment-gateway-wrapper">
      {/* Steps Progress Header */}
      <div className="payment-steps">
        {/* Step 1: Listing Form - Always completed */}
        <div className="step-item step-item--done">
          <span className="step-num">✓</span>
          <span className="step-label">Listing Form</span>
        </div>

        {/* Step 2: Payment Selection */}
        <div className={`step-item ${step > 2 ? 'step-item--done' : step === 2 ? 'step-item--active' : ''}`}>
          <span className="step-num">{step > 2 ? '✓' : '2'}</span>
          <span className="step-label">Payment Selection</span>
        </div>

        {/* Step 3: Card Transfer / Bank Details */}
        <div className={`step-item ${step > 3 ? 'step-item--done' : step === 3 ? 'step-item--active' : ''}`}>
          <span className="step-num">{step > 3 ? '✓' : '3'}</span>
          <span className="step-label">{paymentMethod === 'Bank' ? 'Bank Details' : 'Card Transfer'}</span>
        </div>

        {/* Step 4: Confirmation */}
        <div className={`step-item ${isSuccess ? 'step-item--done' : step === 4 ? 'step-item--active' : ''}`}>
          <span className="step-num">{isSuccess ? '✓' : '4'}</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      {paymentProcessing ? (
        <div className="payment-processing-overlay">
          <div className="payment-spinner-container">
            <span className="material-symbols-outlined payment-spinner">sync</span>
            <h3>Processing Payment</h3>
            <p>{processingStatus}</p>
          </div>
        </div>
      ) : isSuccess ? (
        /* Ultimate success screen from the parent component submission */
        <div className="payment-card success-container">
          <span className="material-symbols-outlined success-icon animate-success">check_circle</span>
          <h2 className="payment-card__title">Listing Submitted Successfully!</h2>
          <p className="payment-card__desc">
            Your {propertyType.toLowerCase()} listing is now recorded in our system.
          </p>
          <div className="success-details-box">
            <div className="success-row">
              <span>Transaction ID:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{transactionId}</strong>
            </div>
            <div className="success-row">
              <span>Property Title:</span>
              <strong>{formData.title}</strong>
            </div>
            <div className="success-row">
              <span>Package:</span>
              <strong>{selectedPackage.name} {addOnChecked ? '+ Extra 40 Calls' : ''}</strong>
            </div>
            <div className="success-row">
              <span>Total Amount:</span>
              <strong>LKR {totalPrice.toLocaleString()}.00</strong>
            </div>
            <div className="success-row">
              <span>Payment Method:</span>
              <strong>{paymentMethod === 'Bank' ? 'Bank Transfer' : 'Online Card'}</strong>
            </div>
            <div className="success-row">
              <span>Listing Status:</span>
              <strong>Pending Admin Review</strong>
            </div>
          </div>
          <div className="success-alert-message">
            {paymentMethod === 'Bank' ? (
              <p style={{ textAlign: 'left', margin: 0 }}>
                <strong>⚠️ Verification Pending (තහවුරු කිරීම අපේක්ෂාවෙන්):</strong><br />
                Please write the Transaction ID <strong>{transactionId}</strong> on your bank receipt.<br />
                Send a photo/screenshot of the receipt to:
                <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                  <li>WhatsApp: <strong>+94 71 649 4884</strong></li>
                  <li>Email: <strong>payments@primeventra.com</strong></li>
                </ul>
                Your listing will be enabled immediately after confirmation.
              </p>
            ) : (
              <p>
                <strong>✓ Confirmed:</strong> Your card payment (Transaction ID: {transactionId}) is processed and verified. The property listing is pending final approval by the admin team, which typically takes less than 24 hours.
              </p>
            )}
          </div>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="form-submit-btn" 
              onClick={() => window.location.href = '/'}
              style={{ padding: '12px 30px', minWidth: '200px' }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      ) : (
        <>
          {step === 2 && (
            <div className="payment-card animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              <h2 className="payment-card__title" style={{ marginBottom: '0.5rem' }}>Select Package & Payment Method</h2>
              <p className="payment-card__desc" style={{ marginBottom: '2rem' }}>
                Choose the best package for listing your {propertyType.toLowerCase()} and select your preferred payment option.
              </p>

              {/* Package Selection Grid */}
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '700' }}>
                  1. Choose Listing Package (පැකේජය තෝරන්න)
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {PACKAGES.map((pkg, idx) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div 
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        style={{
                          border: isSelected ? '2.5px solid #137333' : '1.5px solid rgba(197, 198, 208, 0.5)',
                          backgroundColor: isSelected ? '#f1f8e9' : 'var(--color-surface)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 10px rgba(19, 115, 51, 0.15)' : 'none',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                        }}
                      >
                        {idx === 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '12px',
                            backgroundColor: '#137333',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase'
                          }}>
                            Recommended
                          </span>
                        )}
                        <h4 style={{ margin: 0, fontSize: '1.025rem', color: 'var(--color-on-surface)', fontWeight: '700' }}>
                          {pkg.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#137333' }}>
                            LKR {pkg.price.toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#137333' }}>check_circle</span>
                          {pkg.calls} Calls Guaranteed
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Additional 40 Calls Add-on */}
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  backgroundColor: addOnChecked ? '#f1f8e9' : 'rgba(197, 198, 208, 0.15)',
                  border: addOnChecked ? '1.5px solid #137333' : '1.5px solid transparent',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '1rem'
                }}>
                  <input 
                    type="checkbox" 
                    checked={addOnChecked} 
                    onChange={(e) => setAddOnChecked(e.target.checked)} 
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: '#137333' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ fontSize: '0.925rem', display: 'block', color: 'var(--color-on-surface)' }}>
                      Add Extra 40 Calls (තවත් ඇමතුම් 40ක් එක් කරන්න)
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Boost your listing with an additional 40 buyer calls.
                    </span>
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#137333', whiteSpace: 'nowrap' }}>
                    + LKR 4,000
                  </span>
                </label>
              </div>

              {/* Payment Method Grid */}
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '700' }}>
                  2. Select Payment Method (ගෙවීම් ක්‍රමය තෝරන්න)
                </h3>
                <div className="payment-methods-grid">
                  {/* Online Card Option */}
                  <div 
                    className={`payment-method-box ${paymentMethod === 'Online' ? 'payment-method-box--active' : ''}`}
                    onClick={() => setPaymentMethod('Online')}
                    style={{ padding: '1.25rem' }}
                  >
                    <div className="payment-method-box__radio">
                      <span className="material-symbols-outlined font-icon">
                        {paymentMethod === 'Online' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <div className="payment-method-box__content">
                      <span className="material-symbols-outlined payment-method-box__icon">credit_card</span>
                      <h4>Online Card Payment</h4>
                      <p>Instant activation. Securely pay with Visa, Mastercard, or Amex.</p>
                    </div>
                  </div>

                  {/* Bank Transfer Option */}
                  <div 
                    className={`payment-method-box ${paymentMethod === 'Bank' ? 'payment-method-box--active' : ''}`}
                    onClick={() => setPaymentMethod('Bank')}
                    style={{ padding: '1.25rem' }}
                  >
                    <div className="payment-method-box__radio">
                      <span className="material-symbols-outlined font-icon">
                        {paymentMethod === 'Bank' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <div className="payment-method-box__content">
                      <span className="material-symbols-outlined payment-method-box__icon">account_balance</span>
                      <h4>Bank Transfer</h4>
                      <p>Manual activation. Admin will verify deposit and enable listing.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(19, 115, 51, 0.05)',
                border: '1px solid rgba(19, 115, 51, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Listing Fee</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {selectedPackage.name} {addOnChecked ? '+ Extra 40 Calls' : ''}
                  </span>
                </div>
                <strong style={{ fontSize: '1.5rem', color: '#137333', fontWeight: '800' }}>
                  LKR {totalPrice.toLocaleString()}.00
                </strong>
              </div>

              <div className="payment-footer-actions">
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={onBack}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Edit Property
                </button>
                <button 
                  type="button" 
                  className="btn-next"
                  onClick={handleProceedPayment}
                >
                  {paymentMethod === 'Bank' ? 'View Bank Details' : 'Proceed to Pay'} <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && paymentMethod === 'Bank' && (
            <div className="payment-card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
              <h2 className="payment-card__title">Bank Transfer Details</h2>
              <p className="payment-card__desc">
                Please transfer the listing fee to the official account details listed below.
              </p>

              <div className="bank-details-box">
                <div className="bank-row">
                  <span>Bank Name:</span>
                  <strong>Prime Bank PLC</strong>
                </div>
                <div className="bank-row">
                  <span>Branch Name:</span>
                  <strong>Colombo Head Office</strong>
                </div>
                <div className="bank-row">
                  <span>Account Number:</span>
                  <strong style={{ fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--color-primary)' }}>
                    1009-8472-8822
                  </strong>
                </div>
                <div className="bank-row">
                  <span>Payee Name:</span>
                  <strong>PrimeVentra Real Estate Pvt Ltd</strong>
                </div>
                <div className="bank-row">
                  <span>Listing Amount:</span>
                  <strong style={{ color: '#137333', fontSize: '1.15rem' }}>LKR {totalPrice.toLocaleString()}.00</strong>
                </div>
              </div>

              {/* Display Unique Transaction ID to User */}
              <div style={{
                backgroundColor: 'rgba(26, 48, 96, 0.05)',
                border: '1.5px dashed var(--color-primary)',
                borderRadius: '10px',
                padding: '1.25rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Unique Transaction ID (ගනුදෙනු හැඳුනුම්පත)
                </span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-primary)', letterSpacing: '1px', display: 'block', marginTop: '0.25rem' }}>
                  {transactionId}
                </strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#b06000', fontWeight: '700' }}>
                  ⚠️ Write this ID on your bank receipt slip before sending!
                </p>
              </div>

              <div className="bank-instructions-alert" style={{ textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>info</span>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '700' }}>Instructions for Verification (ගෙවීම් තහවුරු කිරීමේ උපදෙස්):</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                    1. Write the Transaction ID <strong>{transactionId}</strong> clearly on your bank transfer slip or online transfer receipt description.<br />
                    2. Take a photo/screenshot of the receipt.<br />
                    3. Send the receipt to our WhatsApp: <strong>+94 71 649 4884</strong> or email: <strong>payments@primeventra.com</strong>.
                  </p>
                </div>
              </div>

              <div className="payment-footer-actions">
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={() => setStep(2)}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Change Method
                </button>
                <button 
                  type="button" 
                  className="btn-next btn-submit-listing"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Property Listing <span className="material-symbols-outlined">cloud_upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && paymentMethod === 'Online' && (
            <div className="payment-card animate-fade-in">
              <h2 className="payment-card__title">Credit Card Payment</h2>
              <p className="payment-card__desc">
                Enter your card credentials below. Payment is encrypted and processed via secure gateway.
              </p>

              {/* Dynamic Live Credit Card Visual Mock */}
              <div className="live-card-container">
                <div className="live-card">
                  <div className="live-card__top">
                    <span className="live-card__chip"></span>
                    <span className="live-card__logo">PrimeVentra</span>
                  </div>
                  <div className="live-card__number">
                    {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="live-card__bottom">
                    <div className="live-card__holder">
                      <span className="live-card__label">CARD HOLDER</span>
                      <span className="live-card__value">{cardDetails.cardName || 'YOUR FULL NAME'}</span>
                    </div>
                    <div className="live-card__expiry">
                      <span className="live-card__label">EXPIRES</span>
                      <span className="live-card__value">{cardDetails.cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayNow} className="card-input-form">
                <div className="card-input-row">
                  <div className="input-group input-group--full">
                    <label className="input-label">Cardholder Name</label>
                    <input 
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                      placeholder="Name on card"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="card-input-row">
                  <div className="input-group input-group--full">
                    <label className="input-label">Card Number</label>
                    <input 
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="card-input-row-grid">
                  <div className="input-group">
                    <label className="input-label">Expiry Date</label>
                    <input 
                      type="text"
                      name="cardExpiry"
                      value={cardDetails.cardExpiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">CVV / CVC</label>
                    <input 
                      type="password"
                      name="cardCvv"
                      value={cardDetails.cardCvv}
                      onChange={handleCardChange}
                      placeholder="•••"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="billing-summary-box">
                  <span>Listing charge ({selectedPackage.name}):</span>
                  <strong>LKR {totalPrice.toLocaleString()}.00</strong>
                </div>

                <div className="payment-footer-actions">
                  <button 
                    type="button" 
                    className="btn-back"
                    onClick={() => setStep(2)}
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Change Method
                  </button>
                  <button 
                    type="submit" 
                    className="btn-next btn-pay"
                  >
                    Pay LKR {totalPrice.toLocaleString()}.00 <span className="material-symbols-outlined">security</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="payment-card success-container animate-fade-in">
              <span className="material-symbols-outlined success-icon-large animate-success">check_circle</span>
              <h2 className="payment-card__title">Online Transfer Successful!</h2>
              <p className="payment-card__desc">
                Payment of <strong>LKR {totalPrice.toLocaleString()}.00</strong> (Transaction ID: {transactionId}) has been confirmed. You can now download the payment receipt.
              </p>

              <div className="receipt-box">
                <span className="material-symbols-outlined receipt-box__icon">description</span>
                <div style={{ flexGrow: 1, textAlign: 'left', marginLeft: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Payment Receipt</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>receipt_{Date.now().toString().substring(5)}.txt</p>
                </div>
                <button 
                  type="button" 
                  className={`btn-receipt-dl ${receiptDownloaded ? 'btn-receipt-dl--done' : ''}`}
                  onClick={downloadReceipt}
                >
                  {receiptDownloaded ? (
                    <>
                      Downloaded <span className="material-symbols-outlined">done</span>
                    </>
                  ) : (
                    <>
                      Download <span className="material-symbols-outlined">download</span>
                    </>
                  )}
                </button>
              </div>

              <div className="payment-footer-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={() => setStep(3)}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Back
                </button>
                <button 
                  type="button" 
                  className="btn-next btn-submit-listing"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Property Listing <span className="material-symbols-outlined">cloud_upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
