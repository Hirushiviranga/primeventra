import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/Home/Home';
import Listing from './pages/Listing/Listing';
import PropertyDetail from './pages/Listing/PropertyDetails';
import ListProperty from './pages/ListProperty/ListProperty';

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

function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Navbar will stay on top of all pages */}
      <Navbar />
      
      {/* Route matching */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/listing/details" element={<PropertyDetail />} />
        <Route path="/list" element={<ListProperty />} />
        
        {/* Fallback route for any other path */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Footer will stay at the bottom of all pages */}
      <Footer />
    </Router>
  );
}

export default App;
