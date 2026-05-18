import { FaCheckCircle, FaAward, FaTools, FaHandshake } from 'react-icons/fa';

const AboutSection = () => {
  const features = [
    {
      icon: FaCheckCircle,
      title: "Quality Products",
      description: "We stock only the most reliable and high-performing batteries and inverters from trusted brands."
    },
    {
      icon: FaAward,
      title: "Expert Guidance",
      description: "We helps you to find the perfect power solution for your specific needs."
    },
    {
      icon: FaTools,
      title: "Professional Installation",
      description: "We provide complete installation services to ensure your power systems work flawlessly."
    },
    {
      icon: FaHandshake,
      title: "Ongoing Support",
      description: "Count on us for maintenance, troubleshooting, and continued service after your purchase."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white reveal">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 font-montserrat mb-6">About Rameshwar Automotive Electronics</h2>
            <p className="text-lg text-gray-700 mb-6">
              With over a decade of experience, we've established ourselves as the leading provider of premium batteries and inverters in the region. Our commitment to quality and customer satisfaction sets us apart.  
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Founded in 2024, Rameshwar Automotive Electronics began as a small shop with a big vision. Today, we serve hundreds of satisfied customers ranging from homeowners to large businesses, providing reliable power solutions for every need.
            </p>
            <p className="text-lg text-gray-700 mb-8">
             We have experienced professionals is dedicated to helping you find the perfect power solution, providing expert installation, and ensuring your complete satisfaction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#contact" 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 text-center"
              >
                Contact Us
              </a>
              <a 
                href="#testimonials" 
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 text-center"
              >
                See Testimonials
              </a>
            </div>
          </div>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <feature.icon className="text-3xl text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-blue-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">1+</div>
            <p className="text-gray-600 font-medium">Years of Experience</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">100+</div>
            <p className="text-gray-600 font-medium">Satisfied Customers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">5</div>
            <p className="text-gray-600 font-medium">Premium Brands</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">100%</div>
            <p className="text-gray-600 font-medium">Quality Assurance</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;