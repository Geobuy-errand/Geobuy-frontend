import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetServiceCategoriesQuery,
  useGetServiceProvidersQuery,
  useCreateServiceRequestMutation,
} from "../../redux/services/serviceApi";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaUserCheck,
  FaHeart,
  FaTools,
  FaBriefcase,
  FaUser,
  FaPlus,
  FaArrowRight,
  FaSpinner,
  FaLocationArrow,
  FaRuler,
} from "react-icons/fa";

const SERVICE_FEE = 1.99;

// Service types by category
const SERVICE_TYPES = {
  care: [
    { value: "elderly_care", label: "Elderly Care" },
    { value: "childcare", label: "Childcare" },
    { value: "personal_care", label: "Personal Care" },
    { value: "dementia_care", label: "Dementia Care" },
    { value: "live_in_care", label: "Live-in Care" },
  ],
  trades: [
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "carpentry", label: "Carpentry" },
    { value: "painting", label: "Painting & Decorating" },
    { value: "carpet_cleaning", label: "Carpet Cleaning" },
    { value: "gardening", label: "Gardening" },
    { value: "roofing", label: "Roofing" },
  ],
  professional: [
    { value: "legal", label: "Legal Services" },
    { value: "accounting", label: "Accounting" },
    { value: "consulting", label: "Consulting" },
    { value: "financial_advice", label: "Financial Advice" },
    { value: "tax_services", label: "Tax Services" },
  ],
  personal: [
    { value: "tutoring", label: "Tutoring" },
    { value: "fitness_training", label: "Fitness Training" },
    { value: "beauty_services", label: "Beauty Services" },
    { value: "massage_therapy", label: "Massage Therapy" },
    { value: "hairdressing", label: "Hairdressing" },
    { value: "nail_tech", label: "Nail Technician" },
    { value: "barbing", label: "Barbing/Haircut" },
  ],
  other: [
    { value: "cleaning_services", label: "Cleaning Services" },
    { value: "event_planning", label: "Event Planning" },
    { value: "pet_sitting", label: "Pet Sitting" },
    { value: "house_sitting", label: "House Sitting" },
    { value: "personal_shopping", label: "Personal Shopping" },
    { value: "custom", label: "Custom Service" },
  ],
};

const FindServices = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dbsChecked: false,
    insured: false,
    rated: false,
    nearest: true,
    maxDistance: 20, // miles
    sortBy: "nearest", // nearest, rating, cheapest
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [serviceRequest, setServiceRequest] = useState({
    category: "",
    serviceType: "",
    description: "",
    location: {
      address: "",
      town: "",
      postcode: "",
      coordinates: null,
    },
    preferredDate: "",
    preferredTime: "",
    budget: "",
    isUrgent: false,
    requiresDBS: false,
    requiresCertification: false,
  });

  const { data: categories, isLoading: categoriesLoading } =
    useGetServiceCategoriesQuery();
    console.log({selectedCategory})

  const { data: providers, isLoading: providersLoading, refetch: refetchProviders } =
    useGetServiceProvidersQuery({
      category: selectedCategory,
      dbsChecked: filters.dbsChecked,
      insured: filters.insured,
      rated: filters.rated,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      radius: filters.maxDistance,
      limit: 50,
    });

  const [createServiceRequest, { isLoading: isCreating }] =
    useCreateServiceRequestMutation();

  const categoryIcons = {
    care: FaHeart,
    trades: FaTools,
    professional: FaBriefcase,
    personal: FaUser,
    other: FaPlus,
  };

  // Get user's location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
          toast.success("Location detected successfully!");
          refetchProviders();
        },
        (error) => {
          console.error("Location error:", error);
          setIsGettingLocation(false);
          toast.error(
            "Could not get your location. Please enter your address manually."
          );
          // Set default location (London)
          setUserLocation({
            lat: 51.5074,
            lng: -0.1276,
          });
        },
        {
          enableHighAccuracy: true, // Forces device to use best available hardware (GPS/Wi-Fi)
          timeout: 10000,           // Stops waiting after 10 seconds instead of hanging forever
          maximumAge: 0             // Forces a fresh location lookup instead of cached data
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error("Geolocation is not supported by your browser.");
      // Set default location (London)
      setUserLocation({
        lat: 51.5074,
        lng: -0.1276,
      });
    }
    
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setServiceRequest((prev) => ({ 
      ...prev, 
      category: categoryId,
      serviceType: "", // Reset service type when category changes
    }));
    setShowRequestForm(true);
  };

  const handleRequestChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceRequest((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationSelect = (suggestion) => {
    const addressParts = suggestion.displayName?.split(",") || [];
    setServiceRequest((prev) => ({
      ...prev,
      location: {
        address: suggestion.displayName || "",
        town: addressParts[1]?.trim() || "",
        postcode: suggestion.postcode || "",
        coordinates: {
          lat: suggestion.lat,
          lng: suggestion.lon,
        },
      },
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!serviceRequest.serviceType) {
      toast.error("Please select a service type");
      return;
    }
    if (!serviceRequest.description) {
      toast.error("Please describe what you need");
      return;
    }

    try {
      const result = await createServiceRequest(serviceRequest).unwrap();
      toast.success("Service request submitted successfully!");
      navigate(`/customer/service-request/${result.serviceRequest._id}`);
    } catch (error) {
      toast.error(error.data?.message || "Failed to submit request");
    }
  };

  // Sort providers by distance or rating
  const sortedProviders = () => {
    if (!providers) return [];
    
    const providersList = [...providers];
    
    if (filters.sortBy === "nearest") {
      providersList.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (filters.sortBy === "rating") {
      providersList.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (filters.sortBy === "cheapest") {
      providersList.sort((a, b) => (a.serviceRates?.hourlyRate || 999) - (b.serviceRates?.hourlyRate || 999));
    }
    
    return providersList;
  };

  const displayProviders = sortedProviders();
  const hasProviders = displayProviders && displayProviders.length > 0;

  // Get available service types for selected category
  const availableServiceTypes = selectedCategory ? SERVICE_TYPES[selectedCategory] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Find Local Services</h1>
            <p className="text-text-light mt-2">
              Connect with trusted local professionals for any service you need
            </p>
          </div>

          {/* Location Detection */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
            >
              {isGettingLocation ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaLocationArrow />
              )}
              <span>{isGettingLocation ? "Detecting..." : "Use My Location"}</span>
            </button>
            {userLocation && (
              <span className="text-sm text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" />
                Location detected
              </span>
            )}
            <div className="flex-1 max-w-xs">
              <select
                value={filters.maxDistance}
                onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                className="input-field py-2"
              >
                <option value={5}>Within 5 miles</option>
                <option value={10}>Within 10 miles</option>
                <option value={20}>Within 20 miles</option>
                <option value={50}>Within 50 miles</option>
                <option value={100}>Any distance</option>
              </select>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
              <input
                type="text"
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-soft">
                <input
                  type="checkbox"
                  checked={filters.dbsChecked}
                  onChange={(e) =>
                    setFilters({ ...filters, dbsChecked: e.target.checked })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">DBS Checked</span>
              </label>
              <label className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-soft">
                <input
                  type="checkbox"
                  checked={filters.insured}
                  onChange={(e) =>
                    setFilters({ ...filters, insured: e.target.checked })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">Insured</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="input-field py-2 w-40"
              >
                <option value="nearest">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="cheapest">Cheapest</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-4">
              Service Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categoriesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-xl"></div>
                  ))
                : categories?.map((category) => {
                    const Icon = categoryIcons[category.id] || FaPlus;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`p-4 rounded-xl text-center transition-all duration-200
                        ${
                          selectedCategory === category.id
                            ? "bg-primary text-white shadow-soft"
                            : "bg-white hover:shadow-soft text-text"
                        }`}
                      >
                        <Icon className="text-2xl mx-auto mb-2" />
                        <p className="font-medium text-sm">{category.label}</p>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Providers List */}
          {selectedCategory && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text">
                    Available Providers
                  </h2>
                  {userLocation && hasProviders && (
                    <p className="text-sm text-text-light">
                      Showing {displayProviders.length} provider(s) near your location
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="btn-primary text-sm py-2"
                >
                  {showRequestForm ? "Hide Form" : "Request Service"}
                </button>
              </div>

              {providersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card mb-4">
                    <div className="skeleton h-24 rounded-xl"></div>
                  </div>
                ))
              ) : !hasProviders ? (
                <div className="card text-center py-12">
                  <p className="text-text-light text-lg">No providers found in this category</p>
                  <p className="text-sm text-text-lighter mt-2">
                    Try adjusting your filters or expanding your search radius
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        ...filters,
                        dbsChecked: false,
                        insured: false,
                        maxDistance: 100,
                      });
                      refetchProviders();
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    Clear filters and expand search
                  </button>
                </div>
              ) : (
                displayProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className="card mb-4 hover:shadow-medium transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <h3 className="font-semibold text-text">
                            {provider.fullName}
                          </h3>
                          <div className="flex items-center text-sm text-yellow-500">
                            <FaStar />
                            <span className="ml-1 text-text-light">
                              {provider.averageRating?.toFixed(1) || "New"}
                            </span>
                          </div>
                          <span className="text-xs text-text-lighter">
                            ({provider.totalReviews || 0} reviews)
                          </span>
                          {provider.distance && (
                            <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              <FaRuler className="mr-1" />
                              {provider.distance.toFixed(1)} miles away
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {provider.verificationBadges?.includes(
                            "dbs_checked"
                          ) && (
                            <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <FaCheckCircle className="mr-1" /> DBS Checked
                            </span>
                          )}
                          {provider.verificationBadges?.includes("insured") && (
                            <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              <FaShieldAlt className="mr-1" /> Insured
                            </span>
                          )}
                          {provider.verificationBadges?.includes(
                            "certified"
                          ) && (
                            <span className="flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <FaCheckCircle className="mr-1" /> Certified
                            </span>
                          )}
                          {provider.verificationBadges?.includes(
                            "id_checked"
                          ) && (
                            <span className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              <FaUserCheck className="mr-1" /> ID Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-light mt-2">
                          {provider.about || `Professional ${selectedCategory} service provider`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {provider.serviceRates?.hourlyRate && (
                          <p className="text-sm text-text-light">
                            <span className="font-semibold text-primary">
                              £{provider.serviceRates.hourlyRate}
                            </span>
                            /hr
                          </p>
                        )}
                        <Link
                          to={`/provider/${provider._id}`}
                          className="btn-outline text-sm py-1 px-4"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Service Request Form */}
          {showRequestForm && selectedCategory && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Request Service
              </h2>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {/* Service Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={serviceRequest.serviceType}
                    onChange={handleRequestChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select a service type...</option>
                    {availableServiceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                    <option value="other">Other (Please specify in description)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={serviceRequest.description}
                    onChange={handleRequestChange}
                    rows="4"
                    className="input-field resize-none"
                    placeholder="Describe what you need..."
                    required
                  />
                </div>

                {/* Location with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Location
                  </label>
                  <AddressAutocomplete
                    label=""
                    placeholder="Enter your address..."
                    value={serviceRequest.location.address}
                    onSelect={handleLocationSelect}
                    onChange={(e) => {
                      setServiceRequest((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          address: e.target.value,
                        },
                      }));
                    }}
                    country="gb"
                    minChars={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={serviceRequest.preferredDate}
                      onChange={handleRequestChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={serviceRequest.preferredTime}
                      onChange={handleRequestChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Budget (£)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={serviceRequest.budget}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="Your estimated budget"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={serviceRequest.isUrgent}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">
                      This is urgent
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="requiresDBS"
                      checked={serviceRequest.requiresDBS}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">
                      Requires DBS checked provider
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="requiresCertification"
                      checked={serviceRequest.requiresCertification}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">
                      Requires certified provider
                    </span>
                  </label>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-blue-700">
                        💳 Service Fee
                      </span>
                      <p className="text-xs text-blue-600">Fixed booking fee</p>
                    </div>
                    <span className="font-bold text-blue-700">
                      £{SERVICE_FEE.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-text-lighter mt-2">
                    * Service fee is charged by GEOBUY. Service provider amount
                    is negotiated directly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{isCreating ? "Submitting..." : "Submit Request"}</span>
                  <FaArrowRight />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindServices;