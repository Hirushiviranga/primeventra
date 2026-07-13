import { useState, useEffect } from 'react';
import 'material-symbols';
import { jsPDF } from 'jspdf';
import logo from '../assets/logo1.png';
import { supabase } from '../api/supabaseClient';

const MAX_RECEIPT_SIZE = 4 * 1024 * 1024; // 4MB

// Downscales and re-encodes an image file client-side so uploads stay well under MAX_RECEIPT_SIZE
// without visibly degrading a normal receipt photo. Leaves non-image files untouched.
async function compressReceiptImage(file) {
  if (!file.type || !file.type.startsWith('image/')) return file;

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const MAX_DIMENSION = 1600;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.85;
  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  while (blob && blob.size > 2 * 1024 * 1024 && quality > 0.4) {
    quality -= 0.15;
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

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
  const [transactionId] = useState(() => 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase());
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
        // Downscale high-resolution logo to reduce PDF size (keeps file under ~100KB instead of 100MB+)
        const canvas = document.createElement('canvas');
        const targetWidth = 300;
        const width = imgElement.naturalWidth || imgElement.width || targetWidth;
        const height = imgElement.naturalHeight || imgElement.height || targetWidth;
        const scale = targetWidth / width;
        canvas.width = targetWidth;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const logoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        doc.addImage(logoDataUrl, 'JPEG', 25, 14, 40, 17);
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
      // PDFs can't be compressed client-side, so cap them at the 4MB target directly.
      // Images are allowed larger here — they get downscaled/compressed under 4MB before upload.
      if (isPdf && file.size > MAX_RECEIPT_SIZE) {
        alert('This PDF is over 4MB. Please upload a smaller file (max 4MB).');
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
      if (isPdf && file.size > MAX_RECEIPT_SIZE) {
        alert('This PDF is over 4MB. Please upload a smaller file (max 4MB).');
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
    await onSubmitListing(finalMethod, finalStatus, transactionId, totalPrice, selectedPackage.name, receiptUrl);
  };

  const handleBankReceiptSubmit = async () => {
    if (!receiptFile) {
      alert('Please select a receipt file to upload.');
      return;
    }

    setIsReceiptUploading(true);
    try {
      const isPdf = receiptFile.name.toLowerCase().endsWith('.pdf') || (receiptFile.type && receiptFile.type.toLowerCase().includes('pdf'));
      const compressedFile = isPdf ? receiptFile : await compressReceiptImage(receiptFile);

      if (compressedFile.size > MAX_RECEIPT_SIZE) {
        throw new Error(`This file is still over 4MB after compression (${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB). Please choose a smaller file.`);
      }

      const fileExt = isPdf ? receiptFile.name.split('.').pop() : 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const uploadContentType = isPdf ? 'application/pdf' : 'image/jpeg';

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, compressedFile, {
          contentType: uploadContentType
        });

      if (uploadError) {
        throw new Error(`Receipt upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      setHasUploadedReceipt(true);
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

        {/* Step 3: Card Details / Bank Details */}
        <div className={`step-item ${(step > 3 || isSuccess) ? 'step-item--done' : step === 3 ? 'step-item--active' : ''}`}>
          <span className="step-num">{(step > 3 || isSuccess) ? '✓' : '3'}</span>
          <span className="step-label">{paymentMethod === 'Bank' ? 'Bank Details' : 'Card Details'}</span>
        </div>

        {/* Step 4: Confirmation (Bank flow has extra sub-steps first) */}
        <div className={`step-item ${isSuccess ? 'step-item--done' : step >= 4 ? 'step-item--active' : ''}`}>
          <span className="step-num">{isSuccess ? '✓' : '4'}</span>
          <span className="step-label">
            {paymentMethod === 'Bank'
              ? (step === 4 ? 'Submit Option' : step === 5 ? 'Receipt Upload' : 'Confirmation')
              : 'Confirmation'}
          </span>
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
              hasUploadedReceipt ? (
                <p style={{ textAlign: 'left', margin: 0 }}>
                  <strong>✓ Submitted:</strong> Your property is submitted for admin review. We will respond to you within 24 hours.
                </p>
              ) : (
                <p style={{ textAlign: 'left', margin: 0 }}>
                  <strong>⚠️ Verification Pending:</strong> Please write the Transaction ID <strong>{transactionId}</strong> on your bank receipt.<br />
                  Send a photo/screenshot of the receipt to:
                  <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                    <li>WhatsApp: <strong>+94 71 649 4884</strong></li>
                    <li>Email: <strong>payments@primeventra.com</strong></li>
                  </ul>
                  Your listing will be enabled immediately after confirmation.
                </p>
              )
            ) : (
              <p>
                <strong>✓ Confirmed:</strong> Your card payment is processed and verified. The property listing (Property ID: {propertyId ? 'P' + String(propertyId).padStart(3, '0') : 'N/A'}) is pending final approval by the admin team, which typically takes less than 24 hours.
              </p>
            )}
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

              {/* Payment Method Grid */}
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '700' }}>
                  {isExtraCallsMode ? 'Select Payment Method' : '2. Select Payment Method (ගෙවීම් ක්‍රමය තෝරන්න)'}
                </h3>
                <div className="payment-methods-grid">
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

              <div style={{
                backgroundColor: 'rgba(26, 48, 96, 0.05)',
                border: '1.5px dashed var(--color-primary)',
                borderRadius: '10px',
                padding: '1.25rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Unique Transaction ID
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
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '700' }}>Instructions for Verification:</h4>
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
                  onClick={(e) => { e.preventDefault(); setStep(2); }}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Change Method
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => setStep(4)}
                >
                  Proceed <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && paymentMethod === 'Online' && (
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

          {step === 4 && paymentMethod === 'Bank' && (
            <div className="payment-card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
              <h2 className="payment-card__title" style={{ textAlign: 'center' }}>Choose Submission Path</h2>
              <p className="payment-card__desc" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Select how you want to verify your payment and submit your listing.
              </p>

              <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div
                  className={`payment-method-box ${bankSubmitOption === 'upload' ? 'payment-method-box--active' : ''}`}
                  onClick={() => setBankSubmitOption('upload')}
                  style={{ padding: '1.25rem' }}
                >
                  <div className="payment-method-box__radio">
                    <span className="material-symbols-outlined font-icon">
                      {bankSubmitOption === 'upload' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="payment-method-box__content">
                    <span className="material-symbols-outlined payment-method-box__icon">upload_file</span>
                    <h4>Paid via Online Banking (Upload Receipt)</h4>
                    <p>Select this if you paid using an online banking app or web platform and have a receipt image/PDF.</p>
                  </div>
                </div>

                <div
                  className={`payment-method-box ${bankSubmitOption === 'direct' ? 'payment-method-box--active' : ''}`}
                  onClick={() => setBankSubmitOption('direct')}
                  style={{ padding: '1.25rem' }}
                >
                  <div className="payment-method-box__radio">
                    <span className="material-symbols-outlined font-icon">
                      {bankSubmitOption === 'direct' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="payment-method-box__content">
                    <span className="material-symbols-outlined payment-method-box__icon">account_balance</span>
                    <h4>Direct Bank Deposit / Counter Payment</h4>
                    <p>Select this if you deposited physical cash at a branch counter, or want to send the receipt later via WhatsApp / Email.</p>
                  </div>
                </div>
              </div>

              <div className="payment-footer-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={(e) => { e.preventDefault(); setStep(3); }}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Bank Details
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    if (bankSubmitOption === 'upload') {
                      setStep(5);
                    } else {
                      setStep(6);
                    }
                  }}
                >
                  Proceed <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 5 && paymentMethod === 'Bank' && (
            <div className="payment-card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
              <h2 className="payment-card__title" style={{ textAlign: 'center' }}>Upload Payment Receipt</h2>
              <p className="payment-card__desc" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Please upload the receipt file (PDF, PNG, JPG, or JPEG) for your bank transfer. Max 4MB — larger photos are compressed automatically.
              </p>

              {!receiptFile ? (
                <div
                  onClick={() => document.getElementById('receiptUploadInput').click()}
                  onDragOver={handleReceiptDragOver}
                  onDragLeave={handleReceiptDragLeave}
                  onDrop={handleReceiptDrop}
                  style={{
                    border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--color-outline-variant)',
                    borderRadius: '10px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? 'rgba(15, 41, 74, 0.05)' : 'var(--color-surface-container-low)',
                    transition: 'all 0.2s',
                    marginBottom: '1.5rem'
                  }}
                  onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-outline-variant)'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-text-muted)' }}>upload_file</span>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>
                    {isDragging ? 'Drop file here' : 'Click or Drag & Drop payment receipt'}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>PDF, PNG, JPG, or JPEG (Max 4MB)</p>
                  <input
                    type="file"
                    id="receiptUploadInput"
                    accept="application/pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleReceiptFileChange}
                  />
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '1rem',
                  border: '1.5px solid rgba(19, 115, 51, 0.3)',
                  backgroundColor: 'rgba(19, 115, 51, 0.02)',
                  borderRadius: '10px',
                  marginBottom: '1.5rem'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#137333' }}>
                    {receiptFile.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                  </span>
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{receiptFile.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{(receiptFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReceiptFile}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea4335',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>delete</span>
                  </button>
                </div>
              )}

              {receiptPreview && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'left', fontWeight: '600' }}>Receipt Preview:</p>
                  <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
                    <img src={receiptPreview} alt="Receipt Preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              )}

              <div className="payment-footer-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={(e) => { e.preventDefault(); setStep(4); }}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Submit Option
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    if (!receiptFile) {
                      alert('Please select or upload your bank receipt to proceed.');
                      return;
                    }
                    setStep(6);
                  }}
                >
                  View Confirmation <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 6 && paymentMethod === 'Bank' && (
            <div className="payment-card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
              <h2 className="payment-card__title" style={{ textAlign: 'center' }}>Confirm Listing Submission</h2>
              <p className="payment-card__desc" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Please review your selected package, payment details, and confirm submission.
              </p>

              <div className="bank-details-box" style={{ marginBottom: '1.5rem' }}>
                <div className="bank-row">
                  <span>Selected Package:</span>
                  <strong>{selectedPackage.name} {addOnChecked ? '+ Extra 40 Calls' : ''}</strong>
                </div>
                <div className="bank-row">
                  <span>Total Amount:</span>
                  <strong style={{ color: '#137333' }}>LKR {totalPrice.toLocaleString()}.00</strong>
                </div>
                <div className="bank-row">
                  <span>Payment Method:</span>
                  <strong>Bank Transfer</strong>
                </div>
                <div className="bank-row">
                  <span>Transaction ID:</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{transactionId}</strong>
                </div>
              </div>

              {bankSubmitOption === 'direct' ? (
                <div className="bank-instructions-alert" style={{ textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', border: '1.5px solid #ea4335', backgroundColor: '#fdf3f2', marginBottom: '2rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ea4335', fontSize: '24px' }}>warning</span>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#ea4335' }}>⚠️ Verification Pending:</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', color: '#601e18' }}>
                      Please write the Transaction ID <strong>{transactionId}</strong> on your bank receipt.<br />
                      Send a photo/screenshot of the receipt to:<br />
                      • WhatsApp: <strong>+94 71 649 4884</strong><br />
                      • Email: <strong>payments@primeventra.com</strong><br />
                      Your listing will be enabled immediately after confirmation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bank-instructions-alert" style={{ textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', border: '1.5px solid #137333', backgroundColor: '#f1f8e9', marginBottom: '2rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#137333', fontSize: '24px' }}>check_circle</span>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#137333' }}>Receipt Selected for Upload:</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', color: '#1b5e20' }}>
                      File: <strong>{receiptFile ? receiptFile.name : 'No file selected'}</strong> ({receiptFile ? (receiptFile.size / (1024 * 1024)).toFixed(2) + ' MB' : ''})<br />
                      Your listing and receipt will be uploaded and submitted for review.
                    </p>
                  </div>
                </div>
              )}

              <div className="payment-footer-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={(e) => {
                    e.preventDefault();
                    if (bankSubmitOption === 'upload') {
                      setStep(5);
                    } else {
                      setStep(4);
                    }
                  }}
                >
                  <span className="material-symbols-outlined">arrow_back</span> Back
                </button>
                <button
                  type="button"
                  className="btn-next"
                  style={{ backgroundColor: '#137333' }}
                  onClick={() => {
                    if (bankSubmitOption === 'upload') {
                      handleBankReceiptSubmit();
                    } else {
                      handleFinalSubmit(null);
                    }
                  }}
                  disabled={isSubmitting || isReceiptUploading}
                >
                  {isSubmitting || isReceiptUploading ? 'Submitting...' : (isExtraCallsMode ? 'Submit' : 'Confirm & Submit Listing')} <span className="material-symbols-outlined">done</span>
                </button>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
