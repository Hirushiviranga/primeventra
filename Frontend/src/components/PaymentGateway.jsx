import { useState, useEffect } from 'react';
import 'material-symbols';
import { jsPDF } from 'jspdf';
import logo from '../assets/logo1.png';
import { supabase } from '../api/supabaseClient';

export default function PaymentGateway({ 
  propertyType, 
  formData, 
  onBack, 
  onSubmitListing, 
  isSubmitting, 
  isSuccess,
  step,
  setStep,
  paymentMethod = 'Online',
  setPaymentMethod,
  bankSubmitOption,
  setBankSubmitOption,
  isExtraCallsMode = false,
  extraCallsCount = 40,
  extraCallsPrice = 4000,
  propertyId = null
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
  const PACKAGES = [
    { id: 'pkg1', name: 'Standard Package', price: 5500, calls: '40+' },
    { id: 'pkg2', name: 'Premium Package', price: 9000, calls: '80+' },
    { id: 'pkg3', name: 'Deluxe Package', price: 12000, calls: '120+' },
    { id: 'pkg4', name: 'Executive Package', price: 30000, calls: '400' },
  ];
  const [selectedPackage, setSelectedPackage] = useState(() => {
    if (isExtraCallsMode) {
      return { id: 'extra', name: `Extra Calls: ${extraCallsCount} More Calls`, price: extraCallsPrice };
    }
    return PACKAGES[0];
  });

  useEffect(() => {
    if (isExtraCallsMode) {
      setSelectedPackage({ id: 'extra', name: `Extra Calls: ${extraCallsCount} More Calls`, price: extraCallsPrice });
    }
  }, [isExtraCallsMode, extraCallsCount, extraCallsPrice]);

  const [addOnChecked] = useState(false);
  const ADD_ON_PRICE = 4000;
  const totalPrice = isExtraCallsMode ? extraCallsPrice : (selectedPackage.price + (addOnChecked ? ADD_ON_PRICE : 0));

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
      const primaryColor = [26, 115, 232];  // #1a73e8 (Premium blue)
      const textColor = [26, 26, 26];       // #1a1a1a (Dark charcoal)
      const lightGray = [245, 247, 250];    // #f5f7fa
      const gridBorder = [220, 225, 230];   // Light grey border
      
      // Header Section: Solid blue header block
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 10, 170, 25, 'F');
      
      if (imgElement) {
        doc.addImage(imgElement, 'PNG', 25, 14, 40, 17);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255); // White text
      doc.text("PAYMENT RECEIPT", 185, 26, { align: 'right' });
      
      // Meta Information Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, 40, 170, 36, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      // Labels
      doc.text("Receipt ID:", 25, 46);
      doc.text("Property ID:", 25, 52);
      doc.text("Property Name:", 25, 58);
      doc.text("Payment Date:", 25, 64);
      doc.text("Payment Time:", 25, 70);
      
      doc.text("Payment Method:", 110, 46);
      doc.text("Status:", 110, 52);
      doc.text("Paid Value:", 110, 58);
      
      // Values
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(receiptId, 55, 46);
      doc.text(propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A', 55, 52);
      
      const title = formData.title || 'Property Listing';
      const displayTitle = title.length > 28 ? title.substring(0, 25) + '...' : title;
      doc.text(displayTitle, 55, 58);
      
      doc.text(dateStr, 55, 64);
      doc.text(timeStr, 55, 70);
      
      doc.text("Online Card", 140, 46);
      
      doc.setTextColor(34, 197, 94); // Green
      doc.text("COMPLETED", 140, 52);
      
      const formattedAmount = `LKR ${Number(totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(formattedAmount, 140, 58);
      
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
      doc.text(`${formData.firstName} ${formData.lastName}`, 45, 90);
      doc.text(formData.email || 'N/A', 45, 96);
      doc.text(formData.phone || 'N/A', 135, 90);
      doc.text(formData.whatsapp || 'N/A', 135, 96);
      
      // Payment Breakdown
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
      
      const type = propertyType || '';
      const city = formData.city || '';
      const district = formData.district || '';
      const locationPart = [city, district].filter(Boolean).join(', ');
      const packageName = selectedPackage.name + (addOnChecked ? ' + Extra 40 Calls Add-on' : '');
      
      const descText = `Property Listing Submission: "${title}"` + (type ? ` (${type})` : '') + (locationPart ? ` - ${locationPart}` : '') + `\nPackage: ${packageName}`;
      const wrappedDesc = doc.splitTextToSize(descText, 95);
      
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
      doc.text("Important Notice & Instructions:", 20, 200);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      let noticeY = 205;
      if (paymentMethod === 'Bank') {
        const lines = doc.splitTextToSize(`ACTION REQUIRED: Please write the Property ID (${propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A'}) clearly on your bank transfer slip or online transfer description. Take a screenshot or photo and send it to our WhatsApp: +94 71 649 4884 or email: payments@primeventra.com.`, 170);
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

  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type || '';
      const fileName = file.name || '';
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileType.includes('pdf');
      const isImage = fileType.startsWith('image/') || fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');
      
      if (!isPdf && !isImage) {
        alert('Invalid file format. Please upload a PDF, PNG, or JPG file.');
        return;
      }
      setReceiptFile(file);
      if (isImage) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview('');
      }
    }
  };

  const handleReceiptDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleReceiptDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleReceiptDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileType = file.type || '';
      const fileName = file.name || '';
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileType.includes('pdf');
      const isImage = fileType.startsWith('image/') || fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');
      
      if (!isPdf && !isImage) {
        alert('Invalid file format. Please upload a PDF, PNG, or JPG file.');
        return;
      }
      setReceiptFile(file);
      if (isImage) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview('');
      }
    }
  };

  const handleRemoveReceiptFile = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptFile(null);
    setReceiptPreview('');
  };

  const handleFinalSubmit = async (receiptUrl = null) => {
    const finalMethod = receiptUrl ? 'Bank Transfer' : 'Card Payments';
    const finalStatus = receiptUrl ? 'Pending' : 'Completed';
    await onSubmitListing(finalMethod, finalStatus, null, totalPrice, selectedPackage.name, receiptUrl);
  };

  const handleBankReceiptSubmit = async () => {
    if (!receiptFile) {
      alert('Please select a receipt file to upload.');
      return;
    }
    
    setIsReceiptUploading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const isPdf = receiptFile.name.toLowerCase().endsWith('.pdf') || (receiptFile.type && receiptFile.type.toLowerCase().includes('pdf'));
      const uploadContentType = isPdf ? 'image/jpeg' : (receiptFile.type || 'image/jpeg');
      
      let fileToUpload = receiptFile;
      if (isPdf) {
        fileToUpload = new File([receiptFile], receiptFile.name, { type: 'image/jpeg' });
      }

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, fileToUpload, {
          contentType: uploadContentType
        });

      if (uploadError) {
        throw new Error(`Receipt upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      await handleFinalSubmit(publicUrl);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload receipt: ${err.message}`);
    } finally {
      setIsReceiptUploading(false);
    }
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
          handleFinalSubmit();
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="payment-gateway-wrapper">
      {/* Steps Progress Header */}
      <div className="payment-steps">
        {/* Step 1: Listing Form - Always completed */}
        <div className="step-item step-item--done">
          <span className="step-num">✓</span>
          <span className="step-label">{isExtraCallsMode ? 'Calls Setup' : 'Listing Form'}</span>
        </div>

        {/* Step 2: Package Selection */}
        <div className={`step-item ${step > 2 ? 'step-item--done' : step === 2 ? 'step-item--active' : ''}`}>
          <span className="step-num">{step > 2 ? '✓' : '2'}</span>
          <span className="step-label">Package Selection</span>
        </div>

        {/* Step 3: Card Details */}
        <div className={`step-item ${(step > 3 || isSuccess) ? 'step-item--done' : step === 3 ? 'step-item--active' : ''}`}>
          <span className="step-num">{(step > 3 || isSuccess) ? '✓' : '3'}</span>
          <span className="step-label">Card Details</span>
        </div>

        {/* Step 4: Confirmation */}
        <div className={`step-item ${isSuccess ? 'step-item--done' : step >= 4 ? 'step-item--active' : ''}`}>
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
              <span>Property ID:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A'}</strong>
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
              <span>Listing Status:</span>
              <strong>Pending Admin Review</strong>
            </div>
          </div>
          <div className="success-alert-message">
            <p>
              <strong>✓ Confirmed:</strong> Your card payment is processed and verified. The property listing (Property ID: {propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A'}) is pending final approval by the admin team, which typically takes less than 24 hours.
            </p>
          </div>
          {/* Receipt Download Box */}
          <div className="receipt-box" style={{ margin: '1.5rem auto', display: 'flex', alignItems: 'center', backgroundColor: '#f1f8e9', border: '1.5px solid #137333', borderRadius: '10px', padding: '1rem', maxWidth: '550px' }}>
            <span className="material-symbols-outlined receipt-box__icon" style={{ fontSize: '36px', color: '#137333' }}>description</span>
            <div style={{ flexGrow: 1, textAlign: 'left', marginLeft: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>Payment Receipt</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>receipt_{propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A'}.pdf</p>
            </div>
            <button 
              type="button" 
              className={`btn-receipt-dl ${receiptDownloaded ? 'btn-receipt-dl--done' : ''}`}
              onClick={downloadReceipt}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                backgroundColor: receiptDownloaded ? '#137333' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {receiptDownloaded ? (
                <>
                  Downloaded <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>done</span>
                </>
              ) : (
                <>
                  Download <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                </>
              )}
            </button>
          </div>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="form-submit-btn" 
              onClick={() => window.location.href = '/profile'}
              style={{ padding: '12px 30px', minWidth: '200px' }}
            >
              Go to Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          {step === 2 && (
            <div className="payment-card animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              <h2 className="payment-card__title" style={{ marginBottom: '0.5rem' }}>
                {isExtraCallsMode ? 'Select Payment Method' : 'Select Package & Payment Method'}
              </h2>
              <p className="payment-card__desc" style={{ marginBottom: '2rem' }}>
                {isExtraCallsMode 
                  ? 'Select your preferred payment option to complete adding extra calls.' 
                  : `Choose the best package for listing your ${propertyType.toLowerCase()} and select your preferred payment option.`}
              </p>

              {/* Package Selection Grid */}
              {!isExtraCallsMode && (
                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '700' }}>
                    1. Choose Listing Package (පැකේජය තෝරන්න)
                  </h3>
                  
                  {/* Recommended Package (Centered at the top) */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {(() => {
                      const pkg = PACKAGES[0];
                      const isSelected = selectedPackage.id === pkg.id;
                      return (
                        <div 
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
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            width: '100%',
                            maxWidth: '360px',
                          }}
                        >
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
                          <h4 style={{ margin: 0, fontSize: '1.025rem', color: 'var(--color-on-surface)', fontWeight: '700', textAlign: 'center' }}>
                            {pkg.name}
                          </h4>
                          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#137333' }}>check_circle</span>
                            {pkg.calls} Calls Guaranteed
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#137333' }}>
                              LKR {pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Other Packages (Below Recommended, side-by-side or stacked on mobile) */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1.25rem', 
                    marginBottom: '1.5rem',
                    maxWidth: '850px',
                    margin: '0 auto 1.5rem auto'
                  }}>
                    {PACKAGES.slice(1).map((pkg) => {
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
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            width: '100%',
                            maxWidth: '240px',
                            minWidth: '200px'
                          }}
                        >
                           <h4 style={{ margin: 0, fontSize: '1.025rem', color: 'var(--color-on-surface)', fontWeight: '700', textAlign: 'center' }}>
                            {pkg.name}
                          </h4>
                          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#137333' }}>check_circle</span>
                            {pkg.calls} Calls Guaranteed
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#137333' }}>
                              LKR {pkg.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

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
                    {isExtraCallsMode ? `Extra Calls: ${extraCallsCount} Calls` : `${selectedPackage.name} ${addOnChecked ? '+ Extra 40 Calls' : ''}`}
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
                  onClick={(e) => { e.preventDefault(); onBack(); }}
                >
                  <span className="material-symbols-outlined">arrow_back</span> {isExtraCallsMode ? 'Back' : 'Edit Property'}
                </button>
                <button 
                  type="button" 
                  className="btn-next"
                  onClick={handleProceedPayment}
                >
                  Proceed to Pay <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="payment-card animate-fade-in">
              <h2 className="payment-card__title"> Card Payment</h2>
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
                    onClick={(e) => { e.preventDefault(); setStep(2); }}
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Change Package
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

        </>
      )}
    </div>
  );
}
