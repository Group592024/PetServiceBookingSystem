import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomerServiceBookingDetail extends StatefulWidget {
  final String bookingId;

  const CustomerServiceBookingDetail({Key? key, required this.bookingId})
      : super(key: key);

  @override
  _CustomerServiceBookingDetailState createState() =>
      _CustomerServiceBookingDetailState();
}

class _CustomerServiceBookingDetailState
    extends State<CustomerServiceBookingDetail> {
  Map<String, dynamic>? booking;
  List<dynamic> serviceItems = [];
  String paymentTypeName = "";
  String accountName = "";
  String bookingStatusName = "";
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
        Uri.parse('http://127.0.0.1:5050/Bookings/${widget.bookingId}'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final bookingData = json.decode(bookingResponse.body)['data'];

      // Fetch payment type
      final paymentResponse = await http.get(
        Uri.parse(
            'http://127.0.0.1:5050/api/PaymentType/${bookingData['paymentTypeId']}'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch account name
      final accountResponse = await http.get(
        Uri.parse(
            'http://127.0.0.1:5050/api/Account?AccountId=${bookingData['accountId']}'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch booking status
      final statusResponse = await http.get(
        Uri.parse(
            'http://127.0.0.1:5050/api/BookingStatus/${bookingData['bookingStatusId']}'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      // Fetch service items
      final serviceItemsResponse = await http.get(
        Uri.parse(
            'http://127.0.0.1:5050/api/BookingServiceItems/${widget.bookingId}'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final serviceItemsData = json.decode(serviceItemsResponse.body)['data'];

      List<dynamic> updatedServiceItems = [];

      // Process each service item to get pet names and service names
      for (var item in serviceItemsData) {
        String petName = "Unknown";
        String serviceName = "Unknown";

        // Get pet name if petId exists
        if (item['petId'] != null) {
          final petResponse = await http.get(
            Uri.parse('http://127.0.0.1:5050/api/Pet/${item['petId']}'),
            headers: {
              "Authorization": "Bearer $token",
              "Content-Type": "application/json",
            },
          );
          final petData = json.decode(petResponse.body)['data'];
          petName = petData != null ? petData['petName'] : "Unknown";
        }

        // Get service name from service variant
        if (item['serviceVariantId'] != null &&
            item['serviceVariantId'] !=
                "00000000-0000-0000-0000-000000000000") {
          try {
            final serviceVariantResponse = await http.get(
              Uri.parse(
                  'http://127.0.0.1:5050/api/ServiceVariant/${item['serviceVariantId']}'),
              headers: {
                "Authorization": "Bearer $token",
                "Content-Type": "application/json",
              },
            );

            final variantData =
                json.decode(serviceVariantResponse.body)['data'];
            if (variantData != null && variantData['serviceId'] != null) {
              final serviceResponse = await http.get(
                Uri.parse(
                    'http://127.0.0.1:5050/api/Service/${variantData['serviceId']}'),
                headers: {
                  "Authorization": "Bearer $token",
                  "Content-Type": "application/json",
                },
              );
              final serviceData = json.decode(serviceResponse.body)['data'];
              serviceName =
                  serviceData != null ? serviceData['serviceName'] : "Unknown";

              // Include variant name if available
              if (variantData['variantName'] != null) {
                serviceName += " (${variantData['variantName']})";
              }
            }
          } catch (e) {
            print("Error fetching service variant: $e");
          }
        }

        // Add the updated item with pet and service names
        updatedServiceItems.add({
          ...item,
          'petName': petName,
          'serviceName': serviceName,
        });
      }

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
        serviceItems = updatedServiceItems;
      });
    } catch (e) {
      setState(() {
        error = "Failed to fetch booking details.";
      });
      print("Error fetching booking details: $e");
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> cancelBooking() async {
    bool confirm = await showCancelConfirmationDialog();
    if (!confirm) return;

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final response = await http.put(
      Uri.parse('http://127.0.0.1:5050/Bookings/cancel/${widget.bookingId}'),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    final responseData = json.decode(response.body);
    if (responseData['flag']) {
      setState(() {
        bookingStatusName = "Cancelled";
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Booking has been cancelled."),
          behavior: SnackBarBehavior.floating,
          margin: EdgeInsets.all(20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Failed to cancel booking."),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          margin: EdgeInsets.all(20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
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
                    Icon(Icons.warning_amber_rounded,
                        color: Colors.orange, size: 60),
                    SizedBox(height: 16),
                    Text(
                      "Confirm Cancellation",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      "Are you sure you want to cancel this booking?",
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Booking Details",
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
                                DateFormat('dd MMM yyyy').format(DateTime.parse(
                                    booking?['bookingDate'] ??
                                        DateTime.now().toString())),
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

                      // Service Items Section
                      Text(
                        "Service Items",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade800,
                        ),
                      ),
                      SizedBox(height: 12),
                      serviceItems.isNotEmpty
                          ? ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: serviceItems.length,
                              itemBuilder: (context, index) {
                                final item = serviceItems[index];
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
                                  child: ListTile(
                                    contentPadding: EdgeInsets.all(16),
                                    leading: Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade50,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(
                                        Icons.pets,
                                        color: Colors.blue.shade700,
                                        size: 30,
                                      ),
                                    ),
                                    title: Text(
                                      item['serviceName'] ?? "Unknown Service",
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        SizedBox(height: 6),
                                        Text(
                                          "Pet: ${item['petName']}",
                                          style: TextStyle(
                                            color: Colors.grey.shade700,
                                          ),
                                        ),
                                        SizedBox(height: 4),
                                        Text(
                                          "Price: ${NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(item['price'] ?? 0)}",
                                          style: TextStyle(
                                            color: Colors.green.shade700,
                                            fontWeight: FontWeight.bold,
                                          ),
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
                                    "No service items found for this booking.",
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
      default:
        return Colors.grey;
    }
  }
}
