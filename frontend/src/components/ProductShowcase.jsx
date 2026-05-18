import { useState } from 'react';
import { FaCarBattery, FaBolt, FaPlug, FaMotorcycle, FaIndustry, FaTruckMoving, FaVial, FaMicrochip, FaTools, FaChargingStation } from 'react-icons/fa';

// Products data
const products = {
  batteries: [
    {
      id: 1,
      name: "Exide Powersafe",
      description: "High-performance car battery with extended life and superior starting power",
      image: "car-battery.jpg",
      icon: FaCarBattery,
      category: "Automotive",
    },
    {
      id: 2,
      name: "Amaron Pro",
      description: "Maintenance-free battery with advanced calcium technology for longer life",
      image: "amaron-battery.jpg",
      icon: FaCarBattery,
      category: "Automotive",
    },
    {
      id: 3,
      name: "SF Sonic Bike",
      description: "Specialized battery for two-wheelers with vibration-resistant design",
      image: "bike-battery.jpg",
      icon: FaMotorcycle,
      category: "Two-Wheeler",
    },
    {
      id: 4,
      name: "Exide Industrial",
      description: "Heavy-duty batteries designed for commercial and industrial applications",
      image: "industrial-battery.jpg",
      icon: FaIndustry,
      category: "Industrial",
    },
  ],
  inverters: [
    {
      id: 5,
      name: "Luminous Eco Volt",
      description: "Energy-efficient home inverter with rapid charging and pure sine wave output",
      image: "luminous-inverter.jpg",
      icon: FaBolt,
      category: "Home",
    },
    {
      id: 6,
      name: "Livfast Solar Hybrid",
      description: "Solar-compatible inverter for sustainable power backup solutions",
      image: "solar-inverter.jpg",
      icon: FaBolt,
      category: "Solar",
    },
    {
      id: 7,
      name: "Luminous Commercial UPS",
      description: "Reliable UPS system for offices and commercial establishments",
      image: "ups-system.jpg",
      icon: FaPlug,
      category: "Commercial",
    },
    {
      id: 8,
      name: "Livfast Heavy Duty",
      description: "High capacity inverter for large homes and small businesses",
      image: "heavy-duty-inverter.jpg",
      icon: FaTruckMoving,
      category: "High Capacity",
    },
  ],
  thinkCareToolkit: [
    {
      id: 9,
      name: "Smart Hydrometer",
      description: "Precision tool for checking battery acid gravity and state of health.",
      image: "hydrometer.jpg",
      icon: FaVial,
      category: "Maintenance",
    },
    {
      id: 10,
      name: "Digital Multimeter",
      description: "Versatile tester for measuring voltage, current, and checking inverter output.",
      image: "multimeter.jpg",
      icon: FaMicrochip,
      category: "Diagnostic",
    },
    {
      id: 11,
      name: "Terminal Cleaner Kit",
      description: "Anti-corrosion brushes and sprays to maintain clean, high-conductivity connections.",
      image: "cleaner-kit.jpg",
      icon: FaTools,
      category: "Maintenance",
    },
    {
      id: 12,
      name: "Jump Starter Power Bank",
      description: "Portable emergency backup to revive dead automotive batteries instantly.",
      image: "jump-starter.jpg",
      icon: FaChargingStation,
      category: "Emergency",
    },
  ],
};

const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState('batteries');

  return (
    <section id="products" className="py-20 bg-gray-50 reveal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 font-montserrat mb-4">Our Premium Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our extensive collection of high-quality batteries and inverters from leading brands
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-full p-1 shadow-md">
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'batteries' ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('batteries')}
            >
              <span className="flex items-center"><FaCarBattery className="mr-2" /> Batteries</span>
            </button>
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'inverters' ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('inverters')}
            >
              <span className="flex items-center"><FaBolt className="mr-2" /> Inverters</span>
            </button>
             <button
              className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'thinkCareToolkit' ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('thinkCareToolkit')}
            >
              <span className="flex items-center"><FaVial className="mr-2" /> thinkCareToolkit</span>
            </button>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products[activeTab].map((product) => (
            <div key={product.id} className="product-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="bg-blue-900 aspect-video flex items-center justify-center p-6">
                <product.icon className="text-5xl text-yellow-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-blue-900">{product.name}</h3>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 py-1 px-2 rounded">{product.category}</span>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <button className="text-blue-700 font-medium hover:text-blue-900 transition-colors flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <a href="#contact" className="text-yellow-500 hover:text-yellow-600 transition-colors font-medium">
                    Inquire
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href="#contact" 
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Request a Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;