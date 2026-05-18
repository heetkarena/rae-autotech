// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <nav className={scrolled ? 'nav-solid' : 'nav-transparent'}>
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-2xl font-bold text-blue-900">
            Rameshwar <span className="text-yellow-500">Autotech</span>
          </a>
          
          {/* Mobile Menu Button (hamburger icon) */}
          <button 
            className="md:hidden text-blue-900 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#" className="text-blue-900 hover:text-blue-700 font-medium">Home</a></li>
              <li><a href="#products" className="text-blue-900 hover:text-blue-700 font-medium">Products</a></li>
              <li><a href="#about" className="text-blue-900 hover:text-blue-700 font-medium">About</a></li>
              <li><a href="#testimonials" className="text-blue-900 hover:text-blue-700 font-medium">Testimonials</a></li>
              <li><a href="#contact" className="text-blue-900 hover:text-blue-700 font-medium">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Mobile Menu (hidden by default, shown when isMenuOpen is true) */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white border-t pt-2">
            <ul className="flex flex-col">
              <li>
                <a 
                  href="#" 
                  className="block py-2 px-4 text-blue-900 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#products" 
                  className="block py-2 px-4 text-blue-900 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Products
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="block py-2 px-4 text-blue-900 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#testimonials" 
                  className="block py-2 px-4 text-blue-900 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="block py-2 px-4 text-blue-900 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  </nav>
  );
};

export default Navbar;