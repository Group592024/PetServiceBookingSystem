import React, { useEffect, useState } from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import VoucherCard from "../../../../components/widget/voucherCard/VoucherCard";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Typography, TextField, InputAdornment } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "@mui/icons-material";
// Banner images (you can replace these with your own)
import banner1 from "../../../../assets/Service/banner1.jpeg";
import banner2 from "../../../../assets/Service/banner2.jpg";
import banner3 from "../../../../assets/Service/banner3.jpg";
const banners = [
  {
    id: 1,
    image: banner1,
    title: "Exclusive Vouchers",
    description:
      "Get amazing discounts on pet services with our special vouchers",
  },
  {
    id: 2,
    image: banner2,
    title: "Seasonal Offers",
    description: "Limited time offers for your beloved pets",
  },
  {
    id: 3,
    image: banner3,
    title: "Premium Deals",
    description: "High-value vouchers for premium services",
  },
];
const CustomerVoucherList = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/Voucher/customer");
        // Check if data.data exists before setting it to rows
        setRows(data.data || []);
      } catch (error) {
        console.error("Error fetching voucher:", error);
        setRows([]);
      }
    };
    fetchBookingStatuses();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // Change banner every 4 seconds

    return () => clearInterval(interval);
  }, []);
  // Search functionality
  useEffect(() => {
    if (!rows) {
      setFilteredRows([]);
      return;
    }

    if (searchTerm.trim() === "") {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter((voucher) =>
        voucher.voucherName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRows(filtered);
    }
  }, [searchTerm, rows]);

  const basePath = "/customer/vouchers/";
  return (
    <div className="bg-blue-50 min-h-screen">
      <NavbarCustomer />

      {/* Banner Slider */}
      <div className="relative w-full h-[400px] overflow-hidden rounded-b-3xl shadow-lg">
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
                  <div className="bg-blue-900 bg-opacity-70 p-10 rounded-xl text-center text-white max-w-2xl">
                    <h2 className="text-4xl font-bold">{banner.title}</h2>
                    <p className="text-xl mt-3">{banner.description}</p>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title and Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Typography
            variant="h4"
            component="h1"
            className="font-bold text-blue-800"
          >
            Available Vouchers
          </Typography>

          <TextField
            variant="outlined"
            placeholder="Search vouchers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-blue-500" />
                </InputAdornment>
              ),
              className: "bg-white rounded-lg",
            }}
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
            }}
          />
        </div>

        {/* Vouchers Grid - Reduced columns for bigger cards */}
        {filteredRows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRows.map((voucher) => (
              <motion.div
                key={voucher.voucherId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <div className="shadow-xl rounded-xl overflow-hidden">
                  <VoucherCard
                    name={voucher.voucherName}
                    discount={voucher.voucherDiscount}
                    basePath={basePath}
                    rowId={"voucherId"}
                    row={voucher}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-blue-100 rounded-xl shadow-md">
            <Typography variant="h6" className="text-blue-800">
              {searchTerm
                ? "No vouchers match your search"
                : "No vouchers available"}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerVoucherList;
