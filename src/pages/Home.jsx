import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClock,
  FaShieldAlt,
  FaUserCheck,
  FaRocket,
  FaShoppingBag,
  FaBox,
  FaFileAlt,
  FaHeart,
  FaRunning,
  FaHandsHelping,
  FaUsers,
  FaLink,
  FaHandshake,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import SignupModal from "../components/modals/SignupModal";

const features = [
  {
    icon: FaShieldAlt,
    title: "Secure and safe",
    description: "Your details, payments and tasks are fully protected.",
  },
  {
    icon: FaUserCheck,
    title: "Trusted providers",
    description: "All helpers are vetted and DBS-checked.",
  },
  {
    icon: FaRocket,
    title: "Fast and reliable",
    description: "We deliver on time, every time.",
  },
  {
    icon: FaClock,
    title: "Save time",
    description: "Get your errands done without leaving home.",
  },
];

const services = [
  {
    icon: FaShoppingBag,
    title: "Shopping",
    description: "Grocery, pharmacy, retail and more",
  },
  {
    icon: FaBox,
    title: "Parcel Delivery",
    description: "Pick up and deliver parcels",
  },
  {
    icon: FaFileAlt,
    title: "Document Delivery",
    description: "Secure document handling",
  },
  {
    icon: FaHeart,
    title: "Care & Domestic Support",
    description: "Basic care and domestic assistance",
  },
];

const exploreOptions = [
  {
    icon: FaRunning,
    title: "Book an Errand",
    description:
      "Get your errands done quickly by trusted local providers. Shopping, deliveries, pickups and more.",
    link: "/customer/create-booking",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    hoverColor: "hover:border-blue-300",
  },
  {
    icon: FaHandsHelping,
    title: "Find Local Services",
    description:
      "Connect with trusted local professionals for care, trades, personal services and more.",
    link: "/find-services",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    hoverColor: "hover:border-purple-300",
  },
  // ============================================================
  // NEW CONNECT OPTION
  // ============================================================
  {
    icon: FaLink,
    title: "Connect with Others",
    description:
      "Pay a one-time fee of £1.99 to connect with people in your area. Network, collaborate, find mentors, and build meaningful relationships.",
    link: "/customer/connect",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    hoverColor: "hover:border-green-300",
  },
];

const Home = () => {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Connect features for the detailed section
  const connectFeatures = [
    {
      icon: FaUsers,
      title: "Network Locally",
      description: "Connect with professionals and like-minded people in your area",
    },
    {
      icon: FaHandshake,
      title: "Find Opportunities",
      description: "Discover collaboration, mentorship, and business partnerships",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Location-Based",
      description: "Meet people near you for in-person or virtual connections",
    },
    {
      icon: FaStar,
      title: "Rate & Review",
      description: "Build trust with a rating system for successful connections",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
              Your Time, <span className="text-primary">Delivered.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light mb-4">
              Shopping, picking up parcels, delivering documents, or basic care
              and domestic support.
            </p>
            <p className="text-md text-text-light mb-8">
              Connect with verified local providers to get your errands done
              quickly and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button
                onClick={() => setIsSignupModalOpen(true)}
                className="btn-primary"
              >
                Get Started
              </button>
              <Link to="/customer/create-booking" className="btn-outline">
                Book an Errand
              </Link>
              <Link to="/find-services" className="btn-secondary">
                Find Services
              </Link>
              <Link
                to="/customer/connect"
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaLink className="text-lg" />
                <span>Connect</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Options Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title text-center">How Can We Help You?</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            Choose the service that fits your needs. From quick errands to
            professional services and networking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {exploreOptions.map((option, index) => (
              <Link
                key={index}
                to={option.link}
                className={`card p-8 border-2 ${option.color} ${option.hoverColor} transition-all duration-300 hover:shadow-large group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <option.icon className={`text-3xl ${option.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">
                    {option.title}
                  </h3>
                  <p className="text-text-light text-sm leading-relaxed">
                    {option.description}
                  </p>
                  <span className="mt-4 text-primary font-medium flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300">
                    <span>Learn More</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Feature Highlight Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaLink className="text-3xl text-green-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Connect with People in Your Area
              </h2>
              <p className="text-text-light text-lg max-w-2xl mx-auto">
                Build meaningful connections with professionals, mentors, and
                like-minded individuals near you. Pay a small one-time fee of
                <span className="text-primary font-bold mx-1">£1.99</span> and
                start networking today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {connectFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="text-xl text-green-600" />
                  </div>
                  <h4 className="font-semibold text-text mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-text-light">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/customer/connect"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-3"
              >
                <FaLink />
                <span>Start Connecting</span>
                <span className="text-sm opacity-75">£1.99</span>
              </Link>
              <p className="text-xs text-text-lighter mt-3">
                * One-time payment. No recurring charges. 100% secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title text-center">What We Offer</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            From everyday tasks to specialized support, we've got you covered.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-large transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <service.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-text-light text-sm">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/services"
              className="text-primary hover:underline font-medium inline-flex items-center space-x-1"
            >
              <span>View all services</span>
              <span className="inline-block">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose GEOBUY Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title text-center">
            Simple, reliable errands—right where you are
          </h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            We make it easy to get your errands done with peace of mind.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-large transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-light text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-light text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and providers on GEOBUY
            Errands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link
              to="/register/customer"
              className="bg-white text-primary px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              I Need Help
            </Link>
            <Link
              to="/become-provider"
              className="bg-amber-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors"
            >
              I Want to Help
            </Link>
            <Link
              to="/customer/connect"
              className="bg-green-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <FaLink />
              <span>Connect Now</span>
            </Link>
          </div>
        </div>
      </section>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </div>
  );
};

export default Home;