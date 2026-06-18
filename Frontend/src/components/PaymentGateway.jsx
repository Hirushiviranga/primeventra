import React, { useState } from 'react';
import 'material-symbols';

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
    const receiptText = `==================================================
              PRIMEVENTRA REAL ESTATE
==================================================
Receipt ID: ${receiptId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

--- CUSTOMER DETAILS ---
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
WhatsApp: ${formData.whatsapp || 'N/A'}

--- LISTING DETAILS ---
Property Title: ${formData.title}
Property Type: ${propertyType}
District: ${formData.district}
City: ${formData.city}
Amount Paid: LKR 5,000.00
Payment Method: Online Card Payment
Payment Status: COMPLETED

==================================================
Thank you for your payment! Your property listing has
been submitted and is pending final admin approval.
==================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${receiptId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        setProcessingStatus('Authorizing transaction (LKR 5,000.00)...');
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
    await onSubmitListing(finalMethod, finalStatus);
  };

  return (
    <div className="payment-gateway-wrapper">
      {/* Steps Progress Header */}
      <div className="payment-steps">
        <div className="step-item step-item--done">
          <span className="step-num">✓</span>
          <span className="step-label">Listing Form</span>
        </div>
        <div className={`step-item ${step >= 2 ? 'step-item--active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Payment Selection</span>
        </div>
        <div className={`step-item ${step >= 3 ? 'step-item--active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">{paymentMethod === 'Bank' ? 'Bank Details' : 'Card Transfer'}</span>
        </div>
        <div className={`step-item ${step >= 4 ? 'step-item--active' : ''}`}>
          <span className="step-num">4</span>
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
              <span>Property Title:</span>
              <strong>{formData.title}</strong>
            </div>
            <div className="success-row">
              <span>Location:</span>
              <strong>{formData.city}, {formData.district}</strong>
            </div>
            <div className="success-row">
              <span>Owner:</span>
              <strong>{formData.firstName} {formData.lastName}</strong>
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
              <p>
                <strong>⚠️ Notice:</strong> Since you chose Bank Transfer, your listing is currently <strong>disabled</strong>. An admin will verify the deposit of LKR 5,000.00 and activate your listing.
              </p>
            ) : (
              <p>
                <strong>✓ Confirmed:</strong> Your card payment is processed and verified. The property listing is pending final approval by the admin team, which typically takes less than 24 hours.
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
            <div className="payment-card animate-fade-in">
              <h2 className="payment-card__title">Select Payment Method</h2>
              <p className="payment-card__desc">
                To list your {propertyType.toLowerCase()} on PrimeVentra, a standard premium listing fee of <strong>LKR 5,000.00</strong> is required.
              </p>

              <div className="payment-methods-grid">
                {/* Online Card Option */}
                <div 
                  className={`payment-method-box ${paymentMethod === 'Online' ? 'payment-method-box--active' : ''}`}
                  onClick={() => setPaymentMethod('Online')}
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
            <div className="payment-card animate-fade-in">
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
                  <strong style={{ color: 'var(--color-secondary)' }}>LKR 5,000.00</strong>
                </div>
              </div>

              <div className="bank-instructions-alert">
                <span className="material-symbols-outlined">info</span>
                <p>
                  After submitting, your property listing will be saved as <strong>Pending Payment</strong>. The admin will verify the transfer and activate your submission in the dashboard.
                </p>
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
                  <span>Premium listing charge:</span>
                  <strong>LKR 5,000.00</strong>
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
                    Pay LKR 5,000.00 <span className="material-symbols-outlined">security</span>
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
                Payment of <strong>LKR 5,000.00</strong> has been confirmed. You can now download the payment receipt.
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
