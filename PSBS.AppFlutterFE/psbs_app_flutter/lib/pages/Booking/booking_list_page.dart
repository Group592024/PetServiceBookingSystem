import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/Booking.dart';
import '../../services/booking_service.dart';
import '../../services/booking_type_service.dart';
import 'booking_detail_page.dart';
import 'booking_hotel_detail_page.dart';
import 'booking_service_detail_page.dart';
import 'add_booking.dart'; 

class BookingListScreen extends StatefulWidget {
  @override
  _BookingListScreenState createState() => _BookingListScreenState();
}

class _BookingListScreenState extends State<BookingListScreen> {
  late Future<List<Booking>> futureBookings;
  final BookingTypeService bookingTypeService = BookingTypeService();
  Map<String, String> bookingTypeNames = {}; // Store fetched booking type names

  @override
  void initState() {
    super.initState();
    futureBookings = BookingService().fetchBookings();
  }

  String formatDate(String dateString) {
    DateTime dateTime = DateTime.parse(dateString);
    return DateFormat('yyyy-MM-dd HH:mm').format(dateTime);
  }

  Future<void> getBookingTypeName(String bookingTypeId) async {
    if (!bookingTypeNames.containsKey(bookingTypeId)) {
      String? typeName = await bookingTypeService.fetchBookingType(bookingTypeId);
      if (typeName != null) {
        setState(() {
          bookingTypeNames[bookingTypeId] = typeName;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: Icon(Icons.add, size: 28), // "Add Booking" button
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => AddBookingPage()),
              ).then((_) {
                // Refresh the booking list after returning from add booking page
                setState(() {
                  futureBookings = BookingService().fetchBookings();
                });
              });
            },
          ),
        ],
      ),
      body: FutureBuilder<List<Booking>>(
        future: futureBookings,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text('No bookings found.'));
          }

          List<Booking> bookings = snapshot.data!;

          return ListView.builder(
            padding: EdgeInsets.all(12),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              Booking booking = bookings[index];

              // Fetch booking type name if not already fetched
              if (!bookingTypeNames.containsKey(booking.bookingTypeId)) {
                getBookingTypeName(booking.bookingTypeId);
              }

              return GestureDetector(
                onTap: () {
                  String? bookingTypeName = bookingTypeNames[booking.bookingTypeId];

                  if (bookingTypeName == "Hotel") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CustomerRoomBookingDetail(bookingId: booking.bookingId),
                      ),
                    );
                  } else if (bookingTypeName == "Service") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CustomerServiceBookingDetail(bookingId: booking.bookingId),
                      ),
                    );
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BookingDetailScreen(booking: booking),
                      ),
                    );
                  }
                },
                child: Container(
                  margin: EdgeInsets.only(bottom: 12),
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        blurRadius: 6,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Booking Code: ${booking.bookingCode}",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Date: ${formatDate(booking.bookingDate)}",
                        style: TextStyle(color: Colors.grey[700]),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Total Amount: \$${booking.totalAmount.toStringAsFixed(2)}",
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.blueAccent,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Booking Type: ${bookingTypeNames[booking.bookingTypeId] ?? 'Loading...'}",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.purple,
                        ),
                      ),
                      SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            booking.isPaid ? "Paid" : "Unpaid",
                            style: TextStyle(
                              color: booking.isPaid ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Icon(
                            booking.isPaid ? Icons.check_circle : Icons.cancel,
                            color: booking.isPaid ? Colors.green : Colors.red,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
