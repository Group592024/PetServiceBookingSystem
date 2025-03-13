import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

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
  String serviceName = "";
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
      final bookingResponse = await http.get(
        Uri.parse('http://10.0.2.2:5050/Bookings/${widget.bookingId}'),
      );
      final bookingData = json.decode(bookingResponse.body)['data'];
      setState(() {
        booking = bookingData;
      });

      final paymentResponse = await http.get(
        Uri.parse(
            'http://10.0.2.2:5050/api/PaymentType/${bookingData['paymentTypeId']}'),
      );
      setState(() {
        paymentTypeName = json.decode(paymentResponse.body)['data']
                ['paymentTypeName'] ??
            "Unknown";
      });

      final accountResponse = await http.get(
        Uri.parse(
            'http://10.0.2.2:5050/api/Account?AccountId=${bookingData['accountId']}'),
      );
      setState(() {
        accountName =
            json.decode(accountResponse.body)['accountName'] ?? "Unknown";
      });

      final statusResponse = await http.get(
        Uri.parse(
            'http://10.0.2.2:5050/api/BookingStatus/${bookingData['bookingStatusId']}'),
      );
      setState(() {
        bookingStatusName = json.decode(statusResponse.body)['data']
                ['bookingStatusName'] ??
            "Unknown";
      });

      final serviceItemsResponse = await http.get(
        Uri.parse(
            'http://10.0.2.2:5050/api/BookingServiceItems/${widget.bookingId}'),
      );
      final serviceItemsData = json.decode(serviceItemsResponse.body)['data'];

      List<dynamic> updatedServiceItems = [];

      if (serviceItemsData.isNotEmpty) {
        final serviceVariantId = serviceItemsData[0]['serviceVariantId'];
        if (serviceVariantId != "00000000-0000-0000-0000-000000000000") {
          final serviceVariantResponse = await http.get(
            Uri.parse(
                'http://10.0.2.2:5050/api/ServiceVariant/$serviceVariantId'),
          );
          final serviceId =
              json.decode(serviceVariantResponse.body)['data']['serviceId'];
          if (serviceId != null) {
            final serviceResponse = await http.get(
              Uri.parse('http://10.0.2.2:5050/api/Service/$serviceId'),
            );
            setState(() {
              serviceName = json.decode(serviceResponse.body)['data']
                      ['serviceName'] ??
                  "Unknown";
            });
          }
        }
      }
      for (var item in serviceItemsData) {
        String petName = "Unknown";
        if (item['petId'] != null) {
          final petResponse = await http.get(
            Uri.parse('http://10.0.2.2:5050/api/Pet/${item['petId']}'),
          );
          final petData = json.decode(petResponse.body)['data'];
          petName = petData != null ? petData['petName'] : "Unknown";
        }

        item['petName'] = petName; // Update pet name in service item
        updatedServiceItems.add(item);
      }

      setState(() {
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
    final response = await http.put(
      Uri.parse('http://10.0.2.2:5050/Bookings/cancel/${widget.bookingId}'),
    );
    final responseData = json.decode(response.body);
    if (responseData['flag']) {
      setState(() {
        bookingStatusName = "Cancelled";
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Booking has been cancelled.")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to cancel booking.")),
      );
    }
  }

  Future<bool> showCancelConfirmationDialog() async {
    return await showDialog(
          context: context,
          barrierDismissible: false, // Prevent closing by tapping outside
          builder: (BuildContext context) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              backgroundColor: Colors.white,
              contentPadding: const EdgeInsets.all(20),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Colors.red, size: 60),
                  const SizedBox(height: 10),
                  const Text(
                    "Are you sure?",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Do you really want to cancel this booking? This action cannot be undone.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.black54),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Padding(
                          padding:
                              EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                          child: Text("No", style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Padding(
                          padding:
                              EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                          child: Text("Yes, Cancel",
                              style: TextStyle(fontSize: 16)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ) ??
        false; // Return false if the dialog is dismissed
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Service Booking Details"),
        backgroundColor: Colors.blue,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: TextStyle(color: Colors.red)))
              : Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailCard(),
                      SizedBox(height: 20),
                      _buildServiceItems(),
                      SizedBox(height: 20),
                      if (bookingStatusName == "Pending" ||
                          bookingStatusName == "Confirmed")
                        _buildCancelButton(),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDetailCard() {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      elevation: 4,
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow("Booking Code:", booking?['bookingCode']),
            _buildDetailRow("Total Amount:", "${booking?['totalAmount']} VND"),
            _buildDetailRow("Account Name:", accountName),
            _buildDetailRow("Status:", bookingStatusName),
            _buildDetailRow("Payment Type:", paymentTypeName),
            _buildDetailRow("Service:", serviceName),
            _buildDetailRow(
              "Booking Date:",
              DateFormat('dd/MM/yyyy')
                  .format(DateTime.parse(booking?['bookingDate'] ?? '')),
            ),
            _buildDetailRow("Notes:", booking?['notes']),
            _buildDetailRow("Paid:", booking?['isPaid'] ? 'Yes' : 'No'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
          Text(value ?? "N/A"),
        ],
      ),
    );
  }

  Widget _buildServiceItems() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Service Items",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 10),
        serviceItems.isNotEmpty
            ? ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: serviceItems.length,
                itemBuilder: (context, index) {
                  final item = serviceItems[index];
                  return Card(
                    elevation: 3,
                    margin: EdgeInsets.symmetric(vertical: 8),
                    child: ListTile(
                      title: Text("Service Name: $serviceName"),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Pet Name: ${item['petName']}"),
                          Text("Price: ${item['price']} VND"),
                        ],
                      ),
                    ),
                  );
                },
              )
            : Text("No service items found for this booking."),
      ],
    );
  }

  Widget _buildCancelButton() {
    return Center(
      child: ElevatedButton(
        onPressed: cancelBooking,
        child: Text("Cancel Booking"),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
