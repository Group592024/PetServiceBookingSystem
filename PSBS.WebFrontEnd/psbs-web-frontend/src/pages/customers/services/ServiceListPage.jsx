import React, { useEffect, useRef, useState } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { useNavigate } from "react-router-dom";
import ServiceCardList from "../../../components/ServiceCustomer/ServiceCardList";
import { motion, AnimatePresence } from "framer-motion";
import banner1 from "../../../assets/Service/banner1.jpeg";
import banner2 from "../../../assets/Service/banner2.jpg";
import banner3 from "../../../assets/Service/banner3.jpg";

const banners = [
  {
    id: 1,
    image: banner1,
    title: "Premium Pet Care Services",
    description:
      "Providing the best care and love for your pets with professional services.",
  },
  {
    id: 2,
    image: banner2,
    title: "Luxury Grooming & Spa",
    description:
      "Give your pets a luxurious experience with our top-notch grooming services.",
  },
  {
    id: 3,
    image: banner3,
    title: "24/7 Veterinary Support",
    description:
      "Ensuring your pet's health with round-the-clock veterinary support and care.",
  },
];

const ServiceListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (isHovering) return; // Don't auto-slide when user is hovering

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [isHovering]);

  const fetchDataFunction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service?showAll=false",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!fetchData.ok) {
        throw new Error(`HTTP error! Status: ${fetchData.status}`);
      }

      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to load services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  const filteredData = data.filter((item) => {
    const nameMatch = item.serviceName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const typeMatch =
      searchType === "" || item.serviceType.typeName === searchType;
    return nameMatch && typeMatch;
  });

  // Get unique service types for filter dropdown
  const serviceTypes = [
    ...new Set(data.map((item) => item.serviceType?.typeName)),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavbarCustomer />

      {/* Banner Slider */}
      <div
        data-testid="banner-container"
        className="relative w-full h-[500px] overflow-hidden rounded-b-[2.5rem] shadow-lg"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Banner Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Banner Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
          onClick={() =>
            setCurrentIndex(
              (prevIndex) => (prevIndex - 1 + banners.length) % banners.length
            )
          }
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
          onClick={() =>
            setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
          }
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <AnimatePresence>
          {banners.map(
            (banner, index) =>
              index === currentIndex && (
                <motion.div
                  key={banner.id}
                  className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 1 }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>

                  <motion.div
                    className="relative z-10 p-10 text-center text-white max-w-3xl mx-auto px-6"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                      {banner.title}
                    </h2>
                    <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                      {banner.description}
                    </p>
                    <button
                      className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={() => {
                        // Scroll to services section
                        document
                          .getElementById("services-section")
                          .scrollIntoView({
                            behavior: "smooth",
                          });
                      }}
                    >
                      Explore Services
                    </button>
                  </motion.div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Service Section */}
      <div
        id="services-section"
        className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl font-bold text-gray-900 mb-4"
            data-testid="test-ne"
          >
            Services For Your Pets
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of pet care services designed to
            keep your furry friends happy, healthy, and well-groomed.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12 mx-[20%]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2">
              <label
                htmlFor="search-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search by Service Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search-name"
                  type="text"
                  placeholder="Search by service name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <label
                htmlFor="service-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Service Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <select
                  id="service-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all duration-200"
                >
                  <option value="">All Types</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {searchName && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <span>Name: {searchName}</span>
                <button
                  onClick={() => setSearchName("")}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {searchType && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <span>Type: {searchType}</span>
                <button
                  onClick={() => setSearchType("")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {(searchName || searchType) && (
              <button
                onClick={() => {
                  setSearchName("");
                  setSearchType("");
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} services
          </div>
        </div>

        {/* Service Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full absolute border-4 border-solid border-gray-200"></div>
                <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-lg text-center">
            <svg
              className="w-12 h-12 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">Service Unavailable</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchDataFunction}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Services Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any services matching your search criteria.
              Please try different filters or browse all services.
            </p>
            <button
              onClick={() => {
                setSearchName("");
                setSearchType("");
              }}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              View All Services
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ServiceCardList data={filteredData} />
          </motion.div>
        )}

        {/* Service Categories Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Our Service Types
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-[15%]">
            {serviceTypes.slice(0, 6).map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {type}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {
                      data.filter((item) => item.serviceType?.typeName === type)
                        .length
                    }{" "}
                    services available
                  </p>
                  <button
                    onClick={() => {
                      setSearchType(type);
                      // Add scrolling to the services section
                      document
                        .getElementById("services-section")
                        .scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    View Services
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceListPage;
