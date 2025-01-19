import React, { useEffect, useState } from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import VoucherCard from "../../../../components/widget/voucherCard/VoucherCard";
import Carousel from "../../../../components/carousel/Carousel";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Typography } from "@mui/material";
const CustomerVoucherList = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/Voucher/customer");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching voucher:", error);
      }
    };
    fetchBookingStatuses();
  }, []);

  const carouselItems = [
    {
      title: "Summer Sale",
      description: "Get up to 50% off on summer collection!",
      imageUrl:
        "https://i.pinimg.com/736x/ae/3c/d3/ae3cd39e8c5f5fe8436c53a0e090ebe3.jpg", // Replace with your image URLs
    },
    {
      title: "Winter Specials",
      description: "Exclusive discounts on winter clothes.",
      imageUrl:
        "https://i.pinimg.com/736x/e9/10/11/e910110bd726192290d394e3673475ee.jpg",
    },
    {
      title: "Spring Fashion",
      description: "Fresh styles for the season.",
      imageUrl:
        "https://i.pinimg.com/736x/b1/75/5c/b1755c8d07811e8440a1c4ea35b7ae24.jpg",
    },
  ];
  const basePath = "/customer/vouchers/";
  return (
    <div>
      <NavbarCustomer />
      <div className="max-w-7xl mx-auto mt-5 px-4 overflow-hidden">
        <div className="container mx-auto pb-6 ">
          <Carousel items={carouselItems} />
        </div>
          {/* Title Section */}
          <div className="mb-6">
          <Typography 
            variant="h5" 
            component="h2" 
            className="font-semibold text-gray-600"
          >
            Available Vouchers
          </Typography>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((voucher) => (
            <div key={voucher.voucherId}>
              <VoucherCard
                name={voucher.voucherName}
                discount={voucher.voucherDiscount}
                basePath={basePath}
                rowId={"voucherId"}
                row={voucher}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerVoucherList;
