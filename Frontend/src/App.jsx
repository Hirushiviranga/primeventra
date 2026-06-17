import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/Home/Home';
import Listing from './pages/Listing/Listing';
import PropertyDetail from './pages/Listing/PropertyDetails';
import ListProperty from './pages/ListProperty/ListProperty';
import ListHouse from './pages/ListProperty/ListHouse';
import ListApartment from './pages/ListProperty/ListApartment';
import ListLand from './pages/ListProperty/ListLand';
import About from './pages/About/About';
import Policy from './pages/Policy/Policy';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import { Navigate } from 'react-router-dom';

// Protected Route wrapper to redirect unauthorized users to login
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('portalUser');
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ScrollToTop helper to scroll the window to the top or to a specific section hash on page transition
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      
      {/* Route matching */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/listing/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/list" element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
        <Route path="/list/house" element={<ProtectedRoute><ListHouse /></ProtectedRoute>} />
        <Route path="/list/apartment" element={<ProtectedRoute><ListApartment /></ProtectedRoute>} />
        <Route path="/list/land" element={<ProtectedRoute><ListLand /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/contact" element={<Contact />} />
        
        
        {/* Fallback route for any other path */}
        <Route path="*" element={<Home />} />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
