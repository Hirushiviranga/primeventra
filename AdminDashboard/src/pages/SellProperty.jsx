import { useState } from 'react'
import { Panel, Btn, FormGroup, SectionDivider, ImageUploadZone } from '../components'
import { DISTRICTS } from '../constants/districts'
import { useAdmin } from '../context/AdminContext'
import styles from '../styles/SellProperty.module.css'

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
    <select value={value} onChange={onChange}>
      <option value="">Select Your District (දිස්ත්‍රික්කය තෝරන්න)</option>
      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
    </select>
  )
}

function LandForm({ onSubmit, addProperty }) {
  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [landType, setLandType] = useState('Residential')
  const [size, setSize] = useState('1')
  const [unit, setUnit] = useState('Perches (පර්චස්)')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Available')
  const [mapLink, setMapLink] = useState('')
  const [negotiable, setNegotiable] = useState('No')

  const handleSubmit = () => {
    if (!title || !price) {
      alert('Please fill in required fields (*)')
      return
    }
    addProperty({
      icon: 'bx bx-landscape',
      name: title,
      meta: `Land • ${size} ${unit.split(' ')[0]}`,
      type: 'Land',
      loc: `${city || 'Unknown'}, ${district || 'Colombo'}`,
      price: price.startsWith('LKR') ? price : `LKR ${price}`,
      status: status.toLowerCase(),
      statusText: status,
      mapLink: mapLink,
      district: district,
      city: city,
      landType: landType,
      size: size,
      unit: unit,
      description: description,
      negotiable: negotiable
    })
    onSubmit()
  }

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-landscape"></i></div>
        <div>
          <h2>Land Information</h2>
          <p>Fill the form and submit for review. <span className={styles.sinhala}>ෆෝරමය පුරවා සමීක්ෂාව සඳහා ඉදිරිපත් කරන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full>
          <input type="text" placeholder="Enter Short Title" value={title} onChange={e => setTitle(e.target.value)} />
        </Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය">
          <DistrictSelect value={district} onChange={e => setDistrict(e.target.value)} />
        </Field>
        <Field label="City" sinhala="නගරය">
          <input type="text" placeholder="Enter Nearest City" value={city} onChange={e => setCity(e.target.value)} />
        </Field>
        <Field label="Land Type *" sinhala="ඉඩම් වර්ගය">
          <select value={landType} onChange={e => setLandType(e.target.value)}>
            <option>Residential</option>
            <option>Agricultural</option>
            <option>Industrial</option>
            <option>Mixed Use</option>
          </select>
        </Field>
        <Field label="Land Size" sinhala="ඉඩමේ ප්‍රමාණය">
          <input type="number" value={size} onChange={e => setSize(e.target.value)} min="0.1" step="0.1" />
        </Field>
        <Field label="Unit" sinhala="ඒකකය">
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            <option>Perches (පර්චස්)</option>
            <option>Acres (අක්කර)</option>
            <option>Hectares</option>
            <option>Sq. Feet</option>
            <option>Sq. Meters</option>
          </select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={description} onChange={e => setDescription(e.target.value)} />
        </Field>
        <Field label="Price *" sinhala="මිල">
          <input type="text" placeholder="Enter Price (LKR)" value={price} onChange={e => setPrice(e.target.value)} />
        </Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={negotiable} onChange={e => setNegotiable(e.target.value)}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={mapLink} onChange={e => setMapLink(e.target.value)} />
        </Field>
        <SectionDivider>Images</SectionDivider>
        <Field label="Main Image" full><ImageUploadZone label="Click to upload main photo" /></Field>
        <Field label="Gallery Images" full><ImageUploadZone label="Click to upload multiple photos" multiple /></Field>
        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSubmit}>Submit for Review</Btn>
          <Btn variant="light">Save as Draft</Btn>
        </div>
      </div>
    </Panel>
  )
}

function HouseForm({ onSubmit, addProperty }) {
  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [landSize, setLandSize] = useState('1')
  const [unit, setUnit] = useState('Perches (පර්චස්)')
  const [houseSize, setHouseSize] = useState('')
  const [bedrooms, setBedrooms] = useState('3')
  const [bathrooms, setBathrooms] = useState('2')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Available')
  const [mapLink, setMapLink] = useState('')
  const [houseType, setHouseType] = useState('Single Story')
  const [completionStatus, setCompletionStatus] = useState('Ready (සූදානම්)')
  const [furnishedStatus, setFurnishedStatus] = useState('Unfurnished (ගෘහ භාණ්ඩ රහිත)')
  const [negotiable, setNegotiable] = useState('No')

  const handleSubmit = () => {
    if (!title || !price || !city || !district) {
      alert('Please fill in required fields (*)')
      return
    }
    addProperty({
      icon: 'bx bx-home',
      name: title,
      meta: `House • ${bedrooms} Beds • ${bathrooms} Baths • ${houseSize || '0'} sqft`,
      type: 'House',
      loc: `${city}, ${district}`,
      price: price.startsWith('LKR') ? price : `LKR ${price}`,
      status: status.toLowerCase(),
      statusText: status,
      mapLink: mapLink,
      district: district,
      city: city,
      landSize: landSize,
      unit: unit,
      houseSize: houseSize,
      houseType: houseType,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      completionStatus: completionStatus,
      furnishedStatus: furnishedStatus,
      description: description,
      negotiable: negotiable
    })
    onSubmit()
  }

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-home"></i></div>
        <div>
          <h2>House Information</h2>
          <p>Fill the form and submit for review. <span className={styles.sinhala}>ෆෝරමය පුරවා සමීක්ෂාව සඳහා ඉදිරිපත් කරන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full><input type="text" placeholder="Enter Short Title" value={title} onChange={e => setTitle(e.target.value)} /></Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය"><DistrictSelect value={district} onChange={e => setDistrict(e.target.value)} /></Field>
        <Field label="City *" sinhala="නගරය"><input type="text" placeholder="Enter Nearest City" value={city} onChange={e => setCity(e.target.value)} /></Field>
        <Field label="Land Size *" sinhala="ඉඩමේ ප්‍රමාණය"><input type="number" value={landSize} onChange={e => setLandSize(e.target.value)} min="0.1" step="0.1" /></Field>
        <Field label="Unit *" sinhala="ඒකකය">
          <select value={unit} onChange={e => setUnit(e.target.value)}><option>Perches (පර්චස්)</option><option>Acres (අක්කර)</option><option>Sq. Feet</option></select>
        </Field>
        <Field label="House Size (sqft) *" sinhala="නිවස් ප්‍රමාණය (වර්ග අඩි)"><input type="number" placeholder="House Size" value={houseSize} onChange={e => setHouseSize(e.target.value)} /></Field>
        <Field label="House Type">
          <select value={houseType} onChange={e => setHouseType(e.target.value)}>
            <option>Single Story</option><option>Double Story</option><option>Triple Story</option>
            <option>Villa</option><option>Bungalow</option><option>Town House</option>
          </select>
        </Field>
        <Field label="Bedrooms *" sinhala="නිදන කාමර">
          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6+</option></select>
        </Field>
        <Field label="Bathrooms *" sinhala="නාන කාමර">
          <select value={bathrooms} onChange={e => setBathrooms(e.target.value)}><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select>
        </Field>
        <Field label="Completion Status">
          <select value={completionStatus} onChange={e => setCompletionStatus(e.target.value)}><option>Ready (සූදානම්)</option><option>Under Construction</option><option>New</option><option>Renovation Required</option></select>
        </Field>
        <Field label="Furnished Status">
          <select value={furnishedStatus} onChange={e => setFurnishedStatus(e.target.value)}><option>Unfurnished (ගෘහ භාණ්ඩ රහිත)</option><option>Semi-Furnished</option><option>Fully Furnished</option></select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={description} onChange={e => setDescription(e.target.value)} />
        </Field>
        <Field label="Price *" sinhala="මිල"><input type="text" placeholder="Enter Price (LKR)" value={price} onChange={e => setPrice(e.target.value)} /></Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={negotiable} onChange={e => setNegotiable(e.target.value)}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={mapLink} onChange={e => setMapLink(e.target.value)} />
        </Field>
        <SectionDivider>Images</SectionDivider>
        <Field label="Main Image" full><ImageUploadZone label="Click to upload main photo" /></Field>
        <Field label="Gallery Images" full><ImageUploadZone label="Click to upload multiple photos" multiple /></Field>
        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSubmit}>Submit for Review</Btn>
          <Btn variant="light">Save as Draft</Btn>
        </div>
      </div>
    </Panel>
  )
}

function ApartmentForm({ onSubmit, addProperty }) {
  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [size, setSize] = useState('')
  const [complex, setComplex] = useState('')
  const [bedrooms, setBedrooms] = useState('2')
  const [bathrooms, setBathrooms] = useState('2')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('Available')
  const [mapLink, setMapLink] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [completionStatus, setCompletionStatus] = useState('Ready (සූදානම්)')
  const [furnishedStatus, setFurnishedStatus] = useState('Unfurnished (ගෘහ භාණ්ඩ රහිත)')
  const [parking, setParking] = useState('No Parking')
  const [amenities, setAmenities] = useState('None')
  const [negotiable, setNegotiable] = useState('No')

  const handleSubmit = () => {
    if (!title || !price || !city || !district) {
      alert('Please fill in required fields (*)')
      return
    }
    addProperty({
      icon: 'bx bx-building',
      name: title,
      meta: `Apartment • ${bedrooms} Beds • ${bathrooms} Baths • ${size || '0'} sqft`,
      type: 'Apartment',
      loc: `${city}, ${district}`,
      price: price.startsWith('LKR') ? price : `LKR ${price}`,
      status: status.toLowerCase(),
      statusText: status,
      mapLink: mapLink,
      district: district,
      city: city,
      size: size,
      apartmentComplex: complex,
      floorNumber: floorNumber,
      totalFloors: totalFloors,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      completionStatus: completionStatus,
      furnishedStatus: furnishedStatus,
      parking: parking,
      amenities: amenities,
      description: description,
      negotiable: negotiable
    })
    onSubmit()
  }

  return (
    <Panel>
      <div className={styles.formHeader}>
        <div className={styles.fshIcon}><i className="bx bx-building"></i></div>
        <div>
          <h2>Apartment Information</h2>
          <p>Fill the form and submit for review. <span className={styles.sinhala}>ෆෝරමය පුරවා සමීක්ෂාව සඳහා ඉදිරිපත් කරන්න.</span></p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Title *" sinhala="දේපළේ නම" full><input type="text" placeholder="Enter Short Title" value={title} onChange={e => setTitle(e.target.value)} /></Field>
        <Field label="District *" sinhala="දිස්ත්‍රික්කය"><DistrictSelect value={district} onChange={e => setDistrict(e.target.value)} /></Field>
        <Field label="City *" sinhala="නගරය"><input type="text" placeholder="Enter Nearest City" value={city} onChange={e => setCity(e.target.value)} /></Field>
        <Field label="Size (sqft) *" sinhala="ප්‍රමාණය (වර්ග අඩි)"><input type="number" placeholder="Size" value={size} onChange={e => setSize(e.target.value)} /></Field>
        <Field label="Apartment Complex *" sinhala="මහල් නිවාස සංකීර්ණය"><input type="text" placeholder="Apartment Complex" value={complex} onChange={e => setComplex(e.target.value)} /></Field>
        <Field label="Floor Number"><input type="number" placeholder="e.g. 5" value={floorNumber} onChange={e => setFloorNumber(e.target.value)} /></Field>
        <Field label="Total Floors in Building"><input type="number" placeholder="e.g. 12" value={totalFloors} onChange={e => setTotalFloors(e.target.value)} /></Field>
        <Field label="Bedrooms *" sinhala="නිදන කාමර">
          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}><option>Studio</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select>
        </Field>
        <Field label="Bathrooms *" sinhala="නාන කාමර">
          <select value={bathrooms} onChange={e => setBathrooms(e.target.value)}><option>1</option><option>2</option><option>3</option><option>4+</option></select>
        </Field>
        <Field label="Completion Status *" sinhala="ඉදිකිරීම් තත්ත්වය">
          <select value={completionStatus} onChange={e => setCompletionStatus(e.target.value)}><option>Ready (සූදානම්)</option><option>Under Construction</option><option>Off-Plan</option></select>
        </Field>
        <Field label="Furnished Status *" sinhala="ගෘහ භාණ්ඩ සහිත තත්ත්වය">
          <select value={furnishedStatus} onChange={e => setFurnishedStatus(e.target.value)}><option>Unfurnished (ගෘහ භාණ්ඩ රහිත)</option><option>Semi-Furnished</option><option>Fully Furnished</option></select>
        </Field>
        <SectionDivider>Amenities</SectionDivider>
        <Field label="Parking">
          <select value={parking} onChange={e => setParking(e.target.value)}><option>No Parking</option><option>1 Space</option><option>2 Spaces</option><option>3+ Spaces</option></select>
        </Field>
        <Field label="Gym / Pool / Security">
          <select value={amenities} onChange={e => setAmenities(e.target.value)}><option>None</option><option>Gym Only</option><option>Pool Only</option><option>Gym + Pool</option><option>Full Amenities</option></select>
        </Field>
        <Field label="Description *" sinhala="විස්තරය" full>
          <textarea placeholder="Describe the property's features, nearby amenities, and key selling points..." value={description} onChange={e => setDescription(e.target.value)} />
        </Field>
        <Field label="Price *" sinhala="මිල"><input type="text" placeholder="Enter Price (LKR)" value={price} onChange={e => setPrice(e.target.value)} /></Field>
        <Field label="Negotiable *" sinhala="මිල සාකච්ඡා කළ හැකද">
          <select value={negotiable} onChange={e => setNegotiable(e.target.value)}>
            <option value="No">No (නැත)</option>
            <option value="Yes">Yes (ඔව්)</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </Field>
        <Field label="Google Map Link">
          <input type="text" placeholder="Paste Google Map URL" value={mapLink} onChange={e => setMapLink(e.target.value)} />
        </Field>
        <SectionDivider>Images</SectionDivider>
        <Field label="Main Image" full><ImageUploadZone label="Click to upload main photo" /></Field>
        <Field label="Gallery Images" full><ImageUploadZone label="Click to upload multiple photos" multiple /></Field>
        <div className={`${styles.formActions} ${styles.full}`}>
          <Btn variant="success" onClick={handleSubmit}>Submit for Review</Btn>
          <Btn variant="light">Save as Draft</Btn>
        </div>
      </div>
    </Panel>
  )
}

export default function SellProperty({ onSubmit }) {
  const [activeTab, setActiveTab] = useState('land')
  const { addProperty } = useAdmin()

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

      {activeTab === 'land'      && <LandForm onSubmit={onSubmit} addProperty={addProperty} />}
      {activeTab === 'house'     && <HouseForm onSubmit={onSubmit} addProperty={addProperty} />}
      {activeTab === 'apartment' && <ApartmentForm onSubmit={onSubmit} addProperty={addProperty} />}
    </div>
  )
}
