import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductShowcase from './components/ProductShowcase';
import AboutSection from './components/AboutSection';
import TestimonialSection from './components/TestimonialSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from "./components/admin/AdminDashboard"
import AdminPanel from "./components/admin/AdminPanel"
import AutoLogout from './components/AutoLogout';

function App() {
  // Scroll reveal animation effect
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="App">
      
      <Routes>
        {/* LANDING PAGE ROUTE */}
        <Route path="/" element={
          <>
            <Navbar />

            <HeroSection />
            <ProductShowcase />
            <AboutSection />
            <TestimonialSection />
            <ContactSection />

            <Footer />
          </>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <AutoLogout>
            <AdminDashboard />
          </AutoLogout>} />
        <Route path="/admin-panel" element={
          <AutoLogout>
            <AdminPanel />
          </AutoLogout>} />
      </Routes>

      
    </div>
  );
}

export default App;