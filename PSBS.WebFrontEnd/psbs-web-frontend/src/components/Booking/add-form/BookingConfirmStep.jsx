import React, { useContext, useEffect, useState } from "react";
import { BookingContext } from "./BookingContext";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip
} from "@mui/material";

const BookingConfirmStep = ({ formData, selectedOption }) => {
  const { bookingRooms, bookingServices,bookingServicesDate, voucherId, totalPrice, discountedPrice, finalDiscount } = useContext(BookingContext);
  const [roomNames, setRoomNames] = useState({});
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [serviceNames, setserviceNames] = useState({});
  const [serviceVariantNames, setServiceVariantNames] = useState({}); 
  const [petNames, setPetNames] = useState({});

  const getToken = () => {
    return sessionStorage.getItem('token');
};

  // Fetch voucher details based on selected voucher ID
  useEffect(() => {
    const fetchVoucherDetails = async () => {
      if (voucherId) {
        try {
          const response = await fetch(`http://localhost:5050/api/Voucher/${voucherId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const data = await response.json();
          if (data.flag) {
            setVoucherDetails(data.data);
          }
        } catch (error) {
          console.error("Error fetching voucher details:", error);
        }
      }
    };

    fetchVoucherDetails();
  }, [voucherId]);

  // Fetch payment type name based on formData.paymentMethod
  useEffect(() => {
    const fetchPaymentType = async () => {
      if (formData.paymentMethod) {
        try {
          const response = await fetch(`http://localhost:5050/api/PaymentType/${formData.paymentMethod}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const data = await response.json();
          if (data.flag) {
            setPaymentTypeName(data.data.paymentTypeName);
          }
        } catch (error) {
          console.error("Error fetching payment type:", error);
        }
      }
    };

    fetchPaymentType();
  }, [formData.paymentMethod]);

  // Fetch room names based on room IDs
  useEffect(() => {
    const fetchRoomNames = async () => {
      const updatedRoomNames = { ...roomNames };
      for (const room of bookingRooms) {
        if (!roomNames[room.room]) {
          try {
            const response = await fetch(`http://localhost:5050/api/Room/${room.room}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedRoomNames[room.room] = data.data.roomName;
            }
          } catch (error) {
            console.error(`Error fetching room name for ID ${room.room}:`, error);
          }
        }
      }
      setRoomNames(updatedRoomNames);
    };

    if (bookingRooms.length > 0) {
      fetchRoomNames();
    }
  }, [bookingRooms]);

  // Fetch room names based on room IDs
  useEffect(() => {
    const fetchServiceNames = async () => {
      const updatedServiceNames = { ...serviceNames };
      for (const service of bookingServices) {
        if (!serviceNames[service.service]) {
          try {
            const response = await fetch(`http://localhost:5050/api/Service/${service.service}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedServiceNames[service.service] = data.data.serviceName;
            }
          } catch (error) {
            console.error(`Error fetching room name for ID ${service.service}:`, error);
          }
        }
      }
      setserviceNames(updatedServiceNames);
    };

    if (bookingServices.length > 0) {
      fetchServiceNames();
    }
  }, [bookingServices]);

  // Fetch Service Variant Names
  useEffect(() => {
    const fetchServiceVariantNames = async () => {
      const updatedVariantNames = { ...serviceVariantNames };
      for (const service of bookingServices) {
        if (service.serviceVariant && !serviceVariantNames[service.serviceVariant]) {
          try {
            const response = await fetch(`http://localhost:5050/api/ServiceVariant/${service.serviceVariant}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedVariantNames[service.serviceVariant] = data.data.serviceContent;
            }
          } catch (error) {
            console.error(`Error fetching service variant name for ID ${service.serviceVariant}:`, error);
          }
        }
      }
      setServiceVariantNames(updatedVariantNames);
    };

    if (bookingServices.length > 0) {
      fetchServiceVariantNames();
    }
  }, [bookingServices]);

  // Fetch pet names for both rooms and services
  useEffect(() => {
    const fetchPetNames = async () => {
      const updatedPetNames = { ...petNames };
      
      // Fetch pet names for room bookings
      for (const room of bookingRooms) {
        if (room.pet && !petNames[room.pet]) {
          try {
            const response = await fetch(`http://localhost:5050/api/pet/${room.pet}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedPetNames[room.pet] = data.data.petName;
            }
          } catch (error) {
            console.error(`Error fetching pet name for ID ${room.pet}:`, error);
          }
        }
      }

      // Fetch pet names for service bookings
      for (const service of bookingServices) {
        if (service.pet && !petNames[service.pet]) {
          try {
            const response = await fetch(`http://localhost:5050/api/pet/${service.pet}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedPetNames[service.pet] = data.data.petName;
            }
          } catch (error) {
            console.error(`Error fetching pet name for ID ${service.pet}:`, error);
          }
        }
      }
      setPetNames(updatedPetNames);
    };

    if (bookingRooms.length > 0 || bookingServices.length > 0) {
      fetchPetNames();
    }
  }, [bookingRooms, bookingServices]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Booking Confirmation
      </Typography>

      {/* Customer Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Customer Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          <ListItem>
            <ListItemText primary="Name" secondary={formData.name || "Not provided"} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Phone" secondary={formData.phone || "Not provided"} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Address" secondary={formData.address || "Not provided"} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Payment Method" secondary={paymentTypeName || "Loading..."} />
          </ListItem>
          {formData.note && (
            <ListItem>
              <ListItemText primary="Special Notes" secondary={formData.note} />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Voucher Information */}
      {voucherDetails && (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Voucher Applied
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Voucher Name" secondary={voucherDetails.voucherName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Discount" secondary={`${voucherDetails.voucherDiscount}%`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Valid Until" secondary={formatDateTime(voucherDetails.voucherEndDate)} />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Booking Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          {selectedOption === "Room" ? "Room Booking Details" : "Service Booking Details"}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {selectedOption === "Room" ? (
          bookingRooms.length > 0 ? (
            <List>
              {bookingRooms.map((room, index) => (
                <ListItem key={index} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <ListItemText
                    primary={roomNames[room.room] || "Loading room..."}
                    secondary={
                      <>
                        <Typography component="span" display="block">
                          Pet: {petNames[room.pet] || "Loading..."}
                        </Typography>
                        <Typography component="span" display="block">
                          {formatDateTime(room.start)} to {formatDateTime(room.end)}
                        </Typography>
                        <Typography component="span" display="block">
                          Camera: {room.camera ? "Yes" : "No"}
                        </Typography>
                        <Typography component="span" display="block" fontWeight="bold">
                          {room.price.toLocaleString()} VND
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No rooms selected</Typography>
          )
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Booking Date: {formatDateTime(bookingServicesDate)}
            </Typography>
            {bookingServices.length > 0 ? (
              <List>
                {bookingServices.map((service, index) => (
                  <ListItem key={index} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <ListItemText
                      primary={serviceNames[service.service] || "Loading service..."}
                      secondary={
                        <>
                          <Typography component="span" display="block">
                            Variant: {serviceVariantNames[service.serviceVariant] || "Standard"}
                          </Typography>
                          <Typography component="span" display="block">
                            Pet: {petNames[service.pet] || "Loading..."}
                          </Typography>
                          <Typography component="span" display="block" fontWeight="bold">
                            {service.price.toLocaleString()} VND
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No services selected</Typography>
            )}
          </>
        )}
      </Box>

      {/* Price Summary */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Payment Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          <ListItem>
            <ListItemText primary="Subtotal" />
            <Typography>{totalPrice.toLocaleString()} VND</Typography>
          </ListItem>
          {finalDiscount > 0 && (
            <ListItem>
              <ListItemText primary="Discount" />
              <Typography color="success.main">-{finalDiscount.toLocaleString()} VND</Typography>
            </ListItem>
          )}
          <ListItem>
            <ListItemText primary="Total Amount" />
            <Typography variant="h6" fontWeight="bold">
              {discountedPrice.toLocaleString()} VND
            </Typography>
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default BookingConfirmStep;
