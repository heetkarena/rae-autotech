import { Link } from 'react-router-dom';
import { FaBolt, FaCar, FaPhoneAlt } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <section className="relative pt-28 lg:pt-36 pb-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 opacity-95 z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-montserrat leading-tight mb-6">
              Power Your <span className="text-yellow-400">Life</span> With 
              <span className="block mt-2">Rameshwar Autotech</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
              Premium batteries and inverters for homes, businesses, and vehicles. 
              Expert service and installation from the most trusted brands.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a 
                href="#products" 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <FaBolt className="mr-2" /> Explore Products
              </a>
              {/* <a 
                href="#contact" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold py-3 px-8 rounded-full transition-all duration-300 flex items-center justify-center"
              >
                <FaPhoneAlt className="mr-2" /> Contact Us
              </a> */}
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-4">
                <FaBolt className="text-white text-xl" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Long-Lasting Batteries</h3>
              <p className="text-blue-100">High-performance batteries with extended lifespan and reliable power output.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-4">
                <FaCar className="text-white text-xl" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Automotive Excellence</h3>
              <p className="text-blue-100">Premium automotive batteries designed for superior starting power and durability.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors sm:translate-y-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Power Backups</h3>
              <p className="text-blue-100">Reliable inverters to keep your essential devices running during power outages.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors sm:translate-y-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Warranty Protection</h3>
              <p className="text-blue-100">All products come with manufacturer warranty and our additional service guarantee.</p>
            </div>
          </div>
        </div>
        
        {/* Trusted by section */}
        <div className="mt-16 lg:mt-24 text-center">
          <p className="text-blue-200 mb-4">Trusted by homes and businesses throughout the region</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="bg-white/10 backdrop-blur-sm py-2 px-4 rounded-lg">
              <span className="text-white font-bold text-lg">100+</span>
              <span className="text-blue-200 text-sm block">Happy Customers</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm py-2 px-4 rounded-lg">
              <span className="text-white font-bold text-lg">1+</span>
              <span className="text-blue-200 text-sm block">Years Experience</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm py-2 px-4 rounded-lg">
              <span className="text-white font-bold text-lg">5</span>
              <span className="text-blue-200 text-sm block">Premium Brands</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm py-2 px-4 rounded-lg">
              <span className="text-white font-bold text-lg">100%</span>
              <span className="text-blue-200 text-sm block">Quality Assurance</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path fill="#ffffff" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="relative block"></path>
          <path fill="#ffffff" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="relative block"></path>
          <path fill="#ffffff" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="relative block"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;