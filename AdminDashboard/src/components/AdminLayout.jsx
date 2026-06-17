import { useState } from 'react'
import styles from '../styles/AdminLayout.module.css'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Toast from './Toast'
import Dashboard from '../pages/Dashboard'
import Analytics from '../pages/Analytics'
import Properties from '../pages/Properties'
import SellProperty from '../pages/SellProperty'
import Submissions from '../pages/Submissions'
import Enquiries from '../pages/Enquiries'
import Settings from '../pages/Settings'
import RejectedProperties from '../pages/RejectedProperties'
import SoldProperties from '../pages/SoldProperties'

const PAGE_META = {
  dashboard:       ['Admin Dashboard',      'Manage property listings, enquiries, and seller submissions.'],
  analytics:       ['Analytics & Reports',  'View visitor stats, property views, and conversion rates.'],
  properties:      ['All Properties',       'View and manage all property listings.'],
  'sell-property': ['Sell Property',      'Submit a new property for listing.'],
  submissions:     ['Seller Submissions',   'Review and approve seller submitted properties.'],
  enquiries:       ['Enquiries / Leads',    'Manage client enquiries and leads.'],
  'rejected-properties': ['Rejected Properties', 'View rejected property submissions and reason details.'],
  'sold-properties':     ['Sold Properties',     'View all properties that have been marked as sold.'],
  settings:        ['System Settings',      'Change administrative passwords and general settings.'],
}

export default function AdminLayout({ onLogout }) {
  const [section, setSection] = useState('dashboard')
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('✅ Action completed!')

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const [title, subtitle] = PAGE_META[section] || PAGE_META.dashboard

  return (
    <div className={styles.layout}>
      <Sidebar active={section} onNav={setSection} onLogout={onLogout} />
      <main className={styles.main}>
        <Topbar title={title} subtitle={subtitle} onLogout={onLogout} />

        {section === 'dashboard'      && <Dashboard onNav={setSection} />}
        {section === 'analytics'      && <Analytics />}
        {section === 'properties'     && <Properties onNav={setSection} />}
        {section === 'sell-property'  && <SellProperty onSubmit={() => triggerToast('✅ Property submitted successfully!')} />}
        {section === 'submissions'    && <Submissions onSubmit={() => triggerToast('✅ Submission approved!')} />}
        {section === 'enquiries'      && <Enquiries />}
        {section === 'rejected-properties' && <RejectedProperties />}
        {section === 'sold-properties'     && <SoldProperties />}
        {section === 'settings'       && <Settings onSave={() => triggerToast('✅ Settings updated successfully!')} />}
      </main>

      <Toast visible={toast} message={toastMessage} />
    </div>
  )
}
