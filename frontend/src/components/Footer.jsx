// src/components/Footer.jsx
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      {/* Main footer content
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Rameshwar Electronics</h3>
            <p className="text-blue-200 mb-4">
              Your trusted partner for premium batteries and inverters. We provide quality products and exceptional service.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="bg-white/10 hover:bg-white/20 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                <FaFacebook className="text-blue-100" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="text-blue-100" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="text-blue-100" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                <FaLinkedin className="text-blue-100" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Products
                </a>
              </li>
              <li>
                <a href="#about" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> About Us
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-blue-100">123 Main Street, Anytown, State 12345</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-yellow-400 mr-3 flex-shrink-0" />
                <a href="mailto:info@rameshwarelectronics.com" className="text-blue-100 hover:text-white">info@rameshwarelectronics.com</a>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-yellow-400 mr-3 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-blue-100 hover:text-white">+91 98765 43210</a>
              </li>
              <li className="text-blue-100 mt-4">
                <p className="font-semibold">Business Hours:</p>
                <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                <p>Sunday: Closed</p>
              </li>
            </ul>
          </div>
        </div>
      </div> */}
      
      {/* Copyright bar with your credit */}
      <div className="bg-blue-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} Rameshwar Automotive Electronics. All rights reserved.
            </p>
            <p className="text-blue-200 text-sm mt-2 md:mt-0 flex items-center">
              Creatively Crafted by Heet Karena <FaHeart className="text-red-400 mx-1" /> with passion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;