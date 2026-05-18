import { useState } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Haresh Solanki",
    position: "Homeowner",
    image: "customer1.jpg",
    rating: 5,
    text: "I installed an Amaron battery and Luminous inverter from Rameshwar Electronics during power cuts in summer. Their team was professional, knowledgeable, and helped me choose the perfect solution for my home."
  },
  {
    id: 2,
    name: "Heet Karena",
    position: "Business Owner",
    image: "customer2.jpg",
    rating: 5,
    text: "As a small business owner, reliable power is crucial. The team at Rameshwar provided excellent service when installing our backup power system. Their pricing was transparent and the quality is outstanding."
  },
  {
    id: 3,
    name: "Nimesh Patel",
    position: "Car Enthusiast",
    image: "customer3.jpg",
    rating: 4,
    text: "I've been using Exide batteries from Rameshwar for my cars for years. They're always helpful with installation and provide honest advice. I wouldn't go anywhere else for my automotive battery needs."
  },
  {
    id: 4,
    name: "Ravi Mehta",
    position: "Apartment Resident",
    image: "customer4.jpg",
    rating: 5,
    text: "When our apartment needed a robust inverter solution, Rameshwar Electronics delivered exceptional service. They helped us understand our power requirements and installed a system that has been working flawlessly."
  },
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  return (
    <section id="testimonials" className="py-20 bg-blue-900 text-white reveal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">What Our Customers Say</h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their experiences
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Testimonial carousel */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <FaQuoteLeft className="text-4xl text-yellow-400 mb-6" />
            
            <div className="mb-6">
              {/* Star rating */}
              <div className="flex mb-4">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 mr-1" />
                ))}
                {[...Array(5 - testimonials[activeIndex].rating)].map((_, i) => (
                  <FaStar key={i + testimonials[activeIndex].rating} className="text-gray-400 mr-1" />
                ))}
              </div>
              
              {/* Testimonial text */}
              <p className="text-lg mb-6">"{testimonials[activeIndex].text}"</p>
              
              {/* Customer info */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold mr-4">
                  {testimonials[activeIndex].name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold">{testimonials[activeIndex].name}</h4>
                  <p className="text-blue-200">{testimonials[activeIndex].position}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Previous testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Indicator dots */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-yellow-400 w-6' : 'bg-white/30'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-lg text-blue-200 mb-6">Join our satisfied customers and experience the difference</p>
          <a 
            href="#contact" 
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Contact Us Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;