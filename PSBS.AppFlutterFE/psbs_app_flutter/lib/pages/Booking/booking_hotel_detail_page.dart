import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomerRoomBookingDetail extends StatefulWidget {
  final String bookingId;

  const CustomerRoomBookingDetail({Key? key, required this.bookingId})
      : super(key: key);

  @override
  _CustomerRoomBookingDetailState createState() =>
      _CustomerRoomBookingDetailState();
}

class _CustomerRoomBookingDetailState extends State<CustomerRoomBookingDetail> {
  Map<String, dynamic>? booking;
  List<dynamic> roomHistory = [];
  String roomName = "Unknown";
  String paymentTypeName = "Unknown";
  String accountName = "Unknown";
  String bookingStatusName = "Unknown";
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchBookingDetails();
  }

  Future<void> fetchBookingDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      // Fetch booking details
      final bookingResponse = await http.get(
        Uri.parse("http://10.0.2.2:5050/Bookings/${widget.bookingId}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final bookingData = json.decode(bookingResponse.body)['data'];

      // Fetch payment type
      final paymentResponse = await http.get(
        Uri.parse(
            "http://10.0.2.2:5050/api/PaymentType/${bookingData['paymentTypeId']}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch account name
      final accountResponse = await http.get(
        Uri.parse(
            "http://10.0.2.2:5050/api/Account?AccountId=${bookingData['accountId']}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch booking status
      final statusResponse = await http.get(
        Uri.parse(
            "http://10.0.2.2:5050/api/BookingStatus/${bookingData['bookingStatusId']}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch room history
      final historyResponse = await http.get(
        Uri.parse("http://10.0.2.2:5050/api/RoomHistories/${widget.bookingId}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      final historyData = json.decode(historyResponse.body)['data'] ?? [];

      setState(() {
        booking = bookingData;
        paymentTypeName = json.decode(paymentResponse.body)['data']
                ['paymentTypeName'] ??
            "Unknown";
        accountName =
            json.decode(accountResponse.body)['accountName'] ?? "Unknown";
        bookingStatusName = json.decode(statusResponse.body)['data']
                ['bookingStatusName'] ??
            "Unknown";
        roomHistory = historyData;
      });

      if (historyData.isNotEmpty) {
        await fetchRoomName(historyData[0]['roomId']);
        await fetchPetNames();
      }
    } catch (error) {
      setState(() {
        this.error = "Failed to load booking details. Please try again.";
      });
      print("Error fetching booking details: $error");
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchPetNames() async {
    List<dynamic> updatedRoomHistory = List.from(roomHistory);

    for (var history in updatedRoomHistory) {
      try {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        final petResponse = await http.get(
          Uri.parse("http://10.0.2.2:5050/api/pet/${history['petId']}"),
          headers: {
            "Authorization": "Bearer $token",
            "Content-Type": "application/json",
          },
        );
        final petData = json.decode(petResponse.body)['data'];
        history['petName'] = petData['petName'] ?? "Unknown Pet";
      } catch (error) {
        history['petName'] = "Unknown Pet";
      }
    }

    setState(() {
      roomHistory = updatedRoomHistory;
    });
  }

  Future<void> fetchRoomName(String roomId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final roomResponse = await http.get(
        Uri.parse("http://10.0.2.2:5050/api/Room/$roomId"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      setState(() {
        roomName =
            json.decode(roomResponse.body)['data']['roomName'] ?? "Unknown";
      });
    } catch (error) {
      print("Error fetching room name: $error");
    }
  }

  Future<void> cancelBooking() async {
    bool confirm = await showCancelConfirmationDialog();
    if (!confirm) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final response = await http.put(
        Uri.parse("http://10.0.2.2:5050/Bookings/cancel/${widget.bookingId}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final responseData = json.decode(response.body);

      if (responseData['flag']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text(responseData['message'] ?? "Booking has been cancelled."),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: EdgeInsets.all(20),
            backgroundColor: Colors.green,
          ),
        );
        setState(() {
          bookingStatusName = "Cancelled";
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                responseData['message'] ?? "The booking can't be cancelled."),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: EdgeInsets.all(20),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Failed to cancel booking. Please try again."),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          margin: EdgeInsets.all(20),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<bool> showCancelConfirmationDialog() async {
    return await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return Dialog(
              backgroundColor: Colors.transparent,
              insetPadding: EdgeInsets.all(20),
              child: AnimatedContainer(
                duration: Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.hotel, color: Colors.orange, size: 60),
                    SizedBox(height: 16),
                    Text(
                      "Cancel Room Booking?",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      "This will cancel all associated room reservations. Are you sure?",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                    ),
                    SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.symmetric(
                                horizontal: 24, vertical: 12),
                            backgroundColor: Colors.grey[200],
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            "No",
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.symmetric(
                                horizontal: 24, vertical: 12),
                            backgroundColor: Colors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 2,
                          ),
                          child: Text(
                            "Yes, Cancel",
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ) ??
        false;
  }

  String formatDate(String dateString) {
    try {
      DateTime date = DateTime.parse(dateString);
      return DateFormat('dd MMM yyyy, hh:mm a').format(date);
    } catch (e) {
      return "Invalid date";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Room Booking Details",
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        backgroundColor: Colors.blue.shade700,
        centerTitle: true,
        elevation: 4,
        shadowColor: Colors.blue.shade100,
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.blue.shade700),
              ),
            )
          : error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: Colors.red,
                        size: 50,
                      ),
                      SizedBox(height: 16),
                      Text(
                        error!,
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: fetchBookingDetails,
                        child: Text("Retry"),
                        style: ElevatedButton.styleFrom(
                          padding: EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          backgroundColor: Colors.blue.shade700,
                        ),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Booking Summary Card
                      AnimatedContainer(
                        duration: Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        margin: EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 10,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "Booking Summary",
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue.shade800,
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(bookingStatusName),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      bookingStatusName,
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              Divider(
                                height: 24,
                                thickness: 1,
                                color: Colors.grey.shade200,
                              ),
                              _buildDetailRow(
                                Icons.confirmation_number,
                                "Booking Code:",
                                booking?['bookingCode'] ?? "N/A",
                              ),
                              _buildDetailRow(
                                Icons.person,
                                "Account Name:",
                                accountName,
                              ),
                              _buildDetailRow(
                                Icons.calendar_today,
                                "Booking Date:",
                                formatDate(booking?['bookingDate'] ??
                                    DateTime.now().toString()),
                              ),
                              _buildDetailRow(
                                Icons.payment,
                                "Payment Type:",
                                paymentTypeName,
                              ),
                              _buildDetailRow(
                                Icons.money,
                                "Total Amount:",
                                "${NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(booking?['totalAmount'] ?? 0)}",
                              ),
                              _buildDetailRow(
                                Icons.note,
                                "Notes:",
                                booking?['notes']?.isNotEmpty == true
                                    ? booking!['notes']
                                    : "No notes",
                              ),
                              _buildDetailRow(
                                Icons.payment,
                                "Payment Status:",
                                booking?['isPaid'] == true ? "Paid" : "Unpaid",
                                isPaid: booking?['isPaid'],
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Room Bookings Section
                      Text(
                        "Room Reservations",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade800,
                        ),
                      ),
                      SizedBox(height: 12),
                      roomHistory.isNotEmpty
                          ? ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: roomHistory.length,
                              itemBuilder: (context, index) {
                                final history = roomHistory[index];
                                return AnimatedContainer(
                                  duration: Duration(milliseconds: 200),
                                  curve: Curves.easeInOut,
                                  margin: EdgeInsets.only(bottom: 12),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    color: Colors.white,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black12,
                                        blurRadius: 6,
                                        offset: Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Padding(
                                    padding: EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Icon(Icons.king_bed,
                                                color: Colors.blue.shade700,
                                                size: 24),
                                            SizedBox(width: 8),
                                            Text(
                                              roomName,
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(height: 12),
                                        _buildRoomDetailRow(
                                          Icons.pets,
                                          "Pet:",
                                          history['petName'] ?? "Unknown Pet",
                                        ),
                                        _buildRoomDetailRow(
                                          Icons.login,
                                          "Check-in:",
                                          formatDate(
                                              history['bookingStartDate']),
                                        ),
                                        _buildRoomDetailRow(
                                          Icons.logout,
                                          "Check-out:",
                                          formatDate(history['bookingEndDate']),
                                        ),
                                        SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Icon(Icons.circle,
                                                color: _getStatusColor(
                                                    history['status']),
                                                size: 16),
                                            SizedBox(width: 8),
                                            Text(
                                              history['status'] ?? "Unknown",
                                              style: TextStyle(
                                                color: Colors.grey.shade700,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            )
                          : Container(
                              padding: EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.info_outline, color: Colors.grey),
                                  SizedBox(width: 10),
                                  Text(
                                    "No room reservations found for this booking.",
                                    style:
                                        TextStyle(color: Colors.grey.shade700),
                                  ),
                                ],
                              ),
                            ),

                      // Cancel Button (if applicable)
                      if (bookingStatusName == "Pending" ||
                          bookingStatusName == "Confirmed")
                        AnimatedContainer(
                          duration: Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                          margin: EdgeInsets.only(top: 24),
                          child: Center(
                            child: ElevatedButton(
                              onPressed: cancelBooking,
                              style: ElevatedButton.styleFrom(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                backgroundColor: Colors.red.shade600,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 2,
                                shadowColor: Colors.red.shade100,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.cancel, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    "Cancel Booking",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      SizedBox(height: 20),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDetailRow(IconData icon, String title, String value,
      {bool? isPaid}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 20,
            color: Colors.blue.shade700,
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: isPaid != null
                        ? isPaid
                            ? Colors.green.shade700
                            : Colors.red.shade700
                        : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 20,
            color: Colors.grey.shade600,
          ),
          SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      case 'checked in':
        return Colors.purple;
      case 'checked out':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }
}
