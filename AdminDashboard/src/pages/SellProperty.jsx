import { useState } from 'react'
import { Panel, Btn, FormGroup, SectionDivider } from '../components'
import { DISTRICTS } from '../constants/districts'
import { useAdmin } from '../context/AdminContext'
import { showAlert } from '../utils/alertModalStore'
import { supabase } from '../api/supabaseClient'
import styles from '../styles/SellProperty.module.css'

const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+']

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://primeventra-vrmv.vercel.app/api';

const TABS = [
  { id: 'land',      icon: 'bx bx-landscape', label: 'Land' },
  { id: 'house',     icon: 'bx bx-home', label: 'House' },
  { id: 'apartment', icon: 'bx bx-building', label: 'Apartment' },
]

function Field({ label, sinhala, full, children }) {
  return <FormGroup label={label} sinhala={sinhala} full={full}>{children}</FormGroup>
}

function DistrictSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} required>
      <option value="">Select Your District (දිස්ත්‍රික්කය තෝරන්න)</option>
      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
    </select>
  )
}

// Uploads File objects to the same Supabase Storage bucket the Frontend list forms use,
// so images posted from the admin form live alongside seller-submitted photos.
async function uploadPhotos(files, folder) {
  const urls = []
  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file)
    if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`)

    const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(filePath)
    urls.push(publicUrl)
  }
  return urls
}

function PhotoUploader({ photos, setPhotos }) {
  const inputId = 'adminImageUpload'

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = 10 - photos.length
    if (files.length > remaining) {
      showAlert(`You can only upload up to 10 images. Only the first ${remaining} images were added.`)
    }
    const allowed = files.slice(0, remaining)
    setPhotos(prev => [...prev, ...allowed.map(file => ({ file, preview: URL.createObjectURL(file) }))])
    e.target.value = ''
  }

  const handleRemove = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  return (
    <div>
      <div
        onClick={() => document.getElementById(inputId).click()}
        style={{ cursor: 'pointer', border: '2px dashed var(--color-outline-variant)', borderRadius: '10px', padding: '24px', textAlign: 'center' }}
      >
        <i className="bx bx-image-add" style={{ fontSize: '28px', color: 'var(--color-primary)' }}></i>
        <p style={{ margin: '8px 0 0', fontSize: '13px', fontWeight: 600 }}>Click to upload images (up to 10)</p>
        <input type="file" id={inputId} accept="image/*" multiple style={{ display: 'none' }} onChange={handleChange} />
      </div>
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginTop: '12px' }}>
          {photos.map((p, idx) => (
            <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-outline-variant)' }}>
              <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{ position: 'absolute', top: '2px', right: '2px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'rgba(234,67,53,0.9)', color: '#fff', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const emptyContact = () => ({ firstName: '', lastName: '', phoneDialCode: '+94', phone: '', whatsappDialCode: '+94', whatsapp: '', email: '' })

function ContactFields({ contact, setContact }) {
  const [sameAsPhone, setSameAsPhone] = useState(false)

  const handleSameAsPhone = (checked) => {
    setSameAsPhone(checked)
    setContact(prev => ({ ...prev, whatsappDialCode: checked ? prev.phoneDialCode : prev.whatsappDialCode, whatsapp: checked ? prev.phone : '' }))
  }

  const handlePhoneChange = (value) => {
    setContact(prev => ({ ...prev, phone: value, whatsapp: sameAsPhone ? value : prev.whatsapp }))
  }

  return (
    <>
      <SectionDivider>Contact Details</SectionDivider>
      <Field label="First Name *">
        <input type="text" placeholder="Owner's First Name" value={contact.firstName} onChange={e => setContact(prev => ({ ...prev, firstName: e.target.value }))} />
      </Field>
      <Field label="Last Name">
        <input type="text" placeholder="Owner's Last Name" value={contact.lastName} onChange={e => setContact(prev => ({ ...prev, lastName: e.target.value }))} />
      </Field>
      <Field label="Phone *">
        <div style={{ display: 'flex', gap: '6px' }}>
          <input type="text" value={contact.phoneDialCode} onChange={e => setContact(prev => ({ ...prev, phoneDialCode: e.target.value }))} style={{ width: '64px', flexShrink: 0 }} />
          <input type="tel" placeholder="77 123 4567" value={contact.phone} onChange={e => handlePhoneChange(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={sameAsPhone} onChange={e => handleSameAsPhone(e.target.checked)} />
          Is this also your WhatsApp number?
        </label>
      </Field>
      <Field label="WhatsApp *">
        <div style={{ display: 'flex', gap: '6px' }}>
          <input type="text" value={contact.whatsappDialCode} disabled={sameAsPhone} onChange={e => setContact(prev => ({ ...prev, whatsappDialCode: e.target.value }))} style={{ width: '64px', flexShrink: 0 }} />
          <input type="tel" placeholder="77 123 4567" value={contact.whatsapp} readOnly={sameAsPhone} onChange={e => setContact(prev => ({ ...prev, whatsapp: e.target.value }))} />
        </div>
      </Field>
      <Field label="Email *">
        <input type="email" placeholder="e.g. email@example.com" value={contact.email} onChange={e => setContact(prev => ({ ...prev, email: e.target.value }))} />
      </Field>
    </>
  )
}

function AgreeToTerms({ checked, onChange }) {
  return (
    <div className={`${styles.full}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: '3px' }} />
      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>I agree to the Terms of Service and Privacy Policy.</span>
    </div>
  )
}

function validateCommon(fields, contact, photos) {
  if (!fields.title || !fields.price || !fields.district || !fields.city || !fields.description) return 'Please fill in required fields (*)'
  if (!contact.firstName || !contact.phone) return 'Please fill in required fields (*)'
  if (!contact.whatsapp) return 'Please enter a WhatsApp number.'
  if (!contact.email) return 'Please fill in required fields (*)'
  if (!fields.agreeToTerms) return 'Please agree to the Terms of Service and Privacy Policy.'
  if (photos.length === 0) return 'Please upload at least one photo.'
  return null
}

function buildDraftPayload(type, fields, contact, photoUrls) {
  return {
    type,
    photos: photoUrls,
    ...fields,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: `${contact.phoneDialCode} ${contact.phone}`,
    whatsapp: contact.whatsapp ? `${contact.whatsappDialCode} ${contact.whatsapp}` : '',
    email: contact.email,
    submittedBy: 'Admin',
    status: 'Draft',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending'
  }
}

async function createDraft(type, folder, fields, contact, photos) {
  const photoUrls = await uploadPhotos(photos.map(p => p.file), folder)
  const payload = buildDraftPayload(type, fields, contact, photoUrls)

  const res = await fetch(`${API_BASE}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to save draft.')
  }
  const resData = await res.json()
  const saved = resData.data && resData.data[0]
  return saved ? (saved.property_id || saved.id) : null
}

// Shared Save / Send to Drafts action bar + submit handlers, used by all three type forms.
function useSubmitActions(type, folder, fields, contact, photos, resetForm, onSubmit) {
  const { fetchListingsAndDrafts } = useAdmin()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSendToDrafts = async () => {
    const error = validateCommon(fields, contact, photos)
    if (error) { showAlert(error); return }
    setIsSubmitting(true)
    try {
      await createDraft(type, folder, fields, contact, photos)
      showAlert('Property saved to Drafts.')
      resetForm()
      fetchListingsAndDrafts()
      onSubmit && onSubmit()
    } catch (err) {
      console.error(err)
      showAlert('Error saving draft: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    const error = validateCommon(fields, contact, photos)
    if (error) { showAlert(error); return }
    setIsSubmitting(true)
    try {
      const draftId = await createDraft(type, folder, fields, contact, photos)
      if (!draftId) throw new Error('Draft was not created correctly.')

      const payRes = await fetch(`${API_BASE}/drafts/${draftId}/toggle-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: true, packageName: 'Standard Package', packagePrice: 5500 })
      })
      if (!payRes.ok) {
        const err = await payRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to move to payments.')
      }

      showAlert('Property saved and moved to Payments, pending admin approval.')
      resetForm()
      fetchListingsAndDrafts()
      onSubmit && onSubmit()
    } catch (err) {
      console.error(err)
      showAlert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { handleSave, handleSendToDrafts, isSubmitting }
}

function LandForm({ onSubmit }) {
  const emptyFields = () => ({ title: '', district: '', city: '', landType: '', landSize: '1', landUnit: 'Perches', description: '', price: '', negotiable: 'No', mapLink: '', agreeToTerms: false })
  const [fields, setFields] = useState(emptyFields())
  const [contact, setContact] = useState(emptyContact())
  const [photos, setPhotos] = useState([])
  const set = (key) => (e) => setFields(prev => ({ ...prev, [key]: e.target.value }))

  const resetForm = () => { setFields(emptyFields()); setContact(emptyContact()); setPhotos([]) }
  const { handleSave, handleSendToDrafts, isSubmitting } = useSubmitActions('Land', 'lands', fields, contact, photos, resetForm, onSubmit)

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-landscape"></i></div>
        <div>
          <h2>Land Information</h2>
          <p>Fill the form and Save or Send to Drafts. <span className={styles.sinhala}>ෆෝරමය පුරවන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full>
          <input type="text" placeholder="Enter Short Title" value={fields.title} onChange={set('title')} />
        </Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය">
          <DistrictSelect value={fields.district} onChange={set('district')} />
        </Field>
        <Field label="City *" sinhala="නගරය">
          <input type="text" placeholder="Enter Nearest City" value={fields.city} onChange={set('city')} />
        </Field>
        <Field label="Land Type *" sinhala="ඉඩම් වර්ගය">
          <select value={fields.landType} onChange={set('landType')}>
            <option value="">Select Land Type (තෝරන්න)</option>
            <option value="Residential">Residential (පදිංචියට)</option>
            <option value="Commercial">Commercial (ව්‍යාපාරික)</option>
            <option value="Agricultural">Agricultural (කෘෂිකාර්මික)</option>
            <option value="Other">Other (වෙනත්)</option>
          </select>
        </Field>
        <Field label="Land Size *" sinhala="ඉඩමේ ප්‍රමාණය">
          <input type="number" value={fields.landSize} onChange={set('landSize')} min="1" />
        </Field>
        <Field label="Unit *" sinhala="ඒකකය">
          <select value={fields.landUnit} onChange={set('landUnit')}>
            <option value="Perches">Perches (පර්චස්)</option>
            <option value="Acres">Acres (අක්කර)</option>
          </select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={fields.description} onChange={set('description')} />
        </Field>
        <Field label="Price *" sinhala="මිල">
          <input type="text" placeholder="Enter Price (LKR)" value={fields.price} onChange={set('price')} />
        </Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={fields.negotiable} onChange={set('negotiable')}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={fields.mapLink} onChange={set('mapLink')} />
        </Field>

        <ContactFields contact={contact} setContact={setContact} />

        <SectionDivider>Images</SectionDivider>
        <Field label="Photos * (up to 10)" full><PhotoUploader photos={photos} setPhotos={setPhotos} /></Field>

        <AgreeToTerms checked={fields.agreeToTerms} onChange={val => setFields(prev => ({ ...prev, agreeToTerms: val }))} />

        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSave} disabled={isSubmitting}>Save</Btn>
          <Btn variant="light" onClick={handleSendToDrafts} disabled={isSubmitting}>Send to Drafts</Btn>
        </div>
      </div>
    </Panel>
  )
}

function HouseForm({ onSubmit }) {
  const emptyFields = () => ({ title: '', district: '', city: '', landSize: '1', landUnit: 'Perches', houseSize: '', bedrooms: '', bathrooms: '', description: '', price: '', negotiable: 'No', mapLink: '', agreeToTerms: false })
  const [fields, setFields] = useState(emptyFields())
  const [contact, setContact] = useState(emptyContact())
  const [photos, setPhotos] = useState([])
  const set = (key) => (e) => setFields(prev => ({ ...prev, [key]: e.target.value }))

  const resetForm = () => { setFields(emptyFields()); setContact(emptyContact()); setPhotos([]) }
  const { handleSave, handleSendToDrafts, isSubmitting } = useSubmitActions('House', 'houses', fields, contact, photos, resetForm, onSubmit)

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-home"></i></div>
        <div>
          <h2>House Information</h2>
          <p>Fill the form and Save or Send to Drafts. <span className={styles.sinhala}>ෆෝරමය පුරවන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full><input type="text" placeholder="Enter Short Title" value={fields.title} onChange={set('title')} /></Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය"><DistrictSelect value={fields.district} onChange={set('district')} /></Field>
        <Field label="City *" sinhala="නගරය"><input type="text" placeholder="Enter Nearest City" value={fields.city} onChange={set('city')} /></Field>
        <Field label="Land Size *" sinhala="ඉඩමේ ප්‍රමාණය"><input type="number" value={fields.landSize} onChange={set('landSize')} min="1" /></Field>
        <Field label="Unit *" sinhala="ඒකකය">
          <select value={fields.landUnit} onChange={set('landUnit')}>
            <option value="Perches">Perches (පර්චස්)</option>
            <option value="Acres">Acres (අක්කර)</option>
          </select>
        </Field>
        <Field label="House Size (sqft) *" sinhala="නිවස් ප්‍රමාණය (වර්ග අඩි)"><input type="number" placeholder="House Size" value={fields.houseSize} onChange={set('houseSize')} /></Field>
        <Field label="Bedrooms *" sinhala="නිදන කාමර">
          <select value={fields.bedrooms} onChange={set('bedrooms')}>
            <option value="">Select Bedrooms (තෝරන්න)</option>
            {ROOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field label="Bathrooms *" sinhala="නාන කාමර">
          <select value={fields.bathrooms} onChange={set('bathrooms')}>
            <option value="">Select Bathrooms (තෝරන්න)</option>
            {ROOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={fields.description} onChange={set('description')} />
        </Field>
        <Field label="Price *" sinhala="මිල"><input type="text" placeholder="Enter Price (LKR)" value={fields.price} onChange={set('price')} /></Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={fields.negotiable} onChange={set('negotiable')}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={fields.mapLink} onChange={set('mapLink')} />
        </Field>

        <ContactFields contact={contact} setContact={setContact} />

        <SectionDivider>Images</SectionDivider>
        <Field label="Photos * (up to 10)" full><PhotoUploader photos={photos} setPhotos={setPhotos} /></Field>

        <AgreeToTerms checked={fields.agreeToTerms} onChange={val => setFields(prev => ({ ...prev, agreeToTerms: val }))} />

        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSave} disabled={isSubmitting}>Save</Btn>
          <Btn variant="light" onClick={handleSendToDrafts} disabled={isSubmitting}>Send to Drafts</Btn>
        </div>
      </div>
    </Panel>
  )
}

function ApartmentForm({ onSubmit }) {
  const emptyFields = () => ({ title: '', district: '', city: '', apartmentSize: '', apartmentComplex: '', bedrooms: '', bathrooms: '', completionStatus: 'Ready', furnishedStatus: 'Unfurnished', description: '', price: '', negotiable: 'No', mapLink: '', agreeToTerms: false })
  const [fields, setFields] = useState(emptyFields())
  const [contact, setContact] = useState(emptyContact())
  const [photos, setPhotos] = useState([])
  const set = (key) => (e) => setFields(prev => ({ ...prev, [key]: e.target.value }))

  const resetForm = () => { setFields(emptyFields()); setContact(emptyContact()); setPhotos([]) }
  const { handleSave, handleSendToDrafts, isSubmitting } = useSubmitActions('Apartment', 'apartments', fields, contact, photos, resetForm, onSubmit)

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-building"></i></div>
        <div>
          <h2>Apartment Information</h2>
          <p>Fill the form and Save or Send to Drafts. <span className={styles.sinhala}>ෆෝරමය පුරවන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full><input type="text" placeholder="Enter Short Title" value={fields.title} onChange={set('title')} /></Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය"><DistrictSelect value={fields.district} onChange={set('district')} /></Field>
        <Field label="City *" sinhala="නගරය"><input type="text" placeholder="Enter Nearest City" value={fields.city} onChange={set('city')} /></Field>
        <Field label="Size (sqft) *" sinhala="ප්‍රමාණය (වර්ග අඩි)"><input type="number" placeholder="Size" value={fields.apartmentSize} onChange={set('apartmentSize')} /></Field>
        <Field label="Apartment Complex *" sinhala="මහල් නිවාස සංකීර්ණය"><input type="text" placeholder="Apartment Complex" value={fields.apartmentComplex} onChange={set('apartmentComplex')} /></Field>
        <Field label="Bedrooms *" sinhala="නිදන කාමර">
          <select value={fields.bedrooms} onChange={set('bedrooms')}>
            <option value="">Select Bedrooms (තෝරන්න)</option>
            {ROOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field label="Bathrooms *" sinhala="නාන කාමර">
          <select value={fields.bathrooms} onChange={set('bathrooms')}>
            <option value="">Select Bathrooms (තෝරන්න)</option>
            {ROOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field label="Completion Status *" sinhala="ඉදිකිරීම් තත්ත්වය">
          <select value={fields.completionStatus} onChange={set('completionStatus')}>
            <option value="Ready">Ready (සූදානම්)</option>
            <option value="Upcoming">Upcoming (ඉදිරියට)</option>
            <option value="Ongoing">Ongoing (ඉදිකරමින් පවතින)</option>
          </select>
        </Field>
        <Field label="Furnished Status *" sinhala="ගෘහ භාණ්ඩ සහිත තත්ත්වය">
          <select value={fields.furnishedStatus} onChange={set('furnishedStatus')}>
            <option value="Unfurnished">Unfurnished (ගෘහ භාණ්ඩ රහිත)</option>
            <option value="Fully Furnished">Fully Furnished (ගෘහ භාණ්ඩ සහිත)</option>
            <option value="Semi Furnished">Semi Furnished (අර්ධ වශයෙන් ගෘහ භාණ්ඩ සහිත)</option>
          </select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={fields.description} onChange={set('description')} />
        </Field>
        <Field label="Price *" sinhala="මිල"><input type="text" placeholder="Enter Price (LKR)" value={fields.price} onChange={set('price')} /></Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={fields.negotiable} onChange={set('negotiable')}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={fields.mapLink} onChange={set('mapLink')} />
        </Field>

        <ContactFields contact={contact} setContact={setContact} />

        <SectionDivider>Images</SectionDivider>
        <Field label="Photos * (up to 10)" full><PhotoUploader photos={photos} setPhotos={setPhotos} /></Field>

        <AgreeToTerms checked={fields.agreeToTerms} onChange={val => setFields(prev => ({ ...prev, agreeToTerms: val }))} />

        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSave} disabled={isSubmitting}>Save</Btn>
          <Btn variant="light" onClick={handleSendToDrafts} disabled={isSubmitting}>Send to Drafts</Btn>
        </div>
      </div>
    </Panel>
  )
}

export default function SellProperty({ onSubmit }) {
  const [activeTab, setActiveTab] = useState('land')

  return (
    <div>
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span><i className={tab.icon}></i></span> {tab.label}
          </div>
        ))}
      </div>

      {activeTab === 'land'      && <LandForm onSubmit={onSubmit} />}
      {activeTab === 'house'     && <HouseForm onSubmit={onSubmit} />}
      {activeTab === 'apartment' && <ApartmentForm onSubmit={onSubmit} />}
    </div>
  )
}
