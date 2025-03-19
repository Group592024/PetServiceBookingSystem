import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

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

  @override
  void initState() {
    super.initState();
    fetchBookingDetails();
  }

  Future<void> fetchBookingDetails() async {
  try {
    final bookingResponse = await http.get(
      Uri.parse("http://127.0.0.1:5050/Bookings/${widget.bookingId}"),
    );
    final bookingData = json.decode(bookingResponse.body)['data'];

    print("Fetched Booking Data: $bookingData"); // Debugging

    final paymentResponse = await http.get(
      Uri.parse(
          "http://127.0.0.1:5050/api/PaymentType/${bookingData['paymentTypeId']}"),
    );
    final accountResponse = await http.get(
      Uri.parse(
          "http://127.0.0.1:5050/api/Account?AccountId=${bookingData['accountId']}"),
    );
    final statusResponse = await http.get(
      Uri.parse(
          "http://127.0.0.1:5050/api/BookingStatus/${bookingData['bookingStatusId']}"),
    );
    final historyResponse = await http.get(
      Uri.parse(
          "http://127.0.0.1:5050/api/RoomHistories/${widget.bookingId}"),
    );

    final historyData = json.decode(historyResponse.body)['data'] ?? [];

    print("Fetched Room History: $historyData"); // Debugging

    setState(() {
      booking = bookingData;
      paymentTypeName = json.decode(paymentResponse.body)['data']
              ['paymentTypeName'] ??
          "Unknown";
      accountName = json.decode(accountResponse.body)['accountName'] ?? "Unknown";
      bookingStatusName = json.decode(statusResponse.body)['data']
              ['bookingStatusName'] ??
          "Unknown";
      roomHistory = historyData;
    });

    if (historyData.isNotEmpty) {
      await fetchRoomName(historyData[0]['roomId']); // Ensure roomName updates
      await fetchPetNames(); // Ensure pet names update
    }

    setState(() {
      isLoading = false;
    });

  } catch (error) {
    print("Error fetching booking details: $error");
    setState(() {
      isLoading = false;
    });
  }
}


  Future<void> fetchPetNames() async {
    List<dynamic> updatedRoomHistory = List.from(roomHistory);

    for (var history in updatedRoomHistory) {
      try {
        final petResponse = await http.get(
          Uri.parse("http://127.0.0.1:5050/api/pet/${history['petId']}"),
        );
        final petData = json.decode(petResponse.body)['data'];
        print("Pet API Response: ${petResponse.body}");

        history['petName'] = petData['petName'] ?? "Unknown Pet";
      } catch (error) {
        print("Error fetching pet name for ${history['petId']}: $error");
        history['petName'] = "Unknown Pet";
      }
    }

    setState(() {
      roomHistory = updatedRoomHistory;
    });
  }

  Future<void> fetchRoomName(String roomId) async {
    try {
      final roomResponse = await http.get(
        Uri.parse("http://10.0.2.2:5050/api/Room/$roomId"),
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

  final response = await http.put(
    Uri.parse("http://127.0.0.1:5050/Bookings/cancel/${widget.bookingId}"),
  );
  final responseData = json.decode(response.body);

  if (responseData['flag']) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(responseData['message'] ?? "Booking has been cancelled."),
      ),
    );
    setState(() {
      bookingStatusName = "Cancelled";
    });
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(responseData['message'] ?? "The booking can't be cancelled."),
      ),
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
            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 60),
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
                    padding: EdgeInsets.symmetric(horizontal: 15, vertical: 8),
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
                    padding: EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                    child: Text("Yes, Cancel", style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    },
  ) ?? false; // Return false if the dialog is dismissed
}


  String formatDate(String dateString) {
    try {
      DateTime date = DateTime.parse(dateString);
      return DateFormat('dd/MM/yyyy hh:mm a').format(date);
    } catch (e) {
      return "Invalid date";
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Room Booking Details"),backgroundColor: Colors.blue,),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: booking != null
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow(
                              "Booking Code", booking!['bookingCode']),
                          _buildDetailRow(
                              "Total Amount", "${booking!['totalAmount']}VND"),
                          _buildDetailRow("Account Name", accountName),
                          _buildDetailRow("Status", bookingStatusName),
                          _buildDetailRow("Payment Type", paymentTypeName),
                          _buildDetailRow(
                              "Booking Date", formatDate(booking!['bookingDate'])),
                          _buildDetailRow("Notes", booking!['notes']),
                          _buildDetailRow(
                              "Paid", booking!['isPaid'] ? 'Yes' : 'No'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text("Room Bookings",
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  roomHistory.isNotEmpty
                      ? ListView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          itemCount: roomHistory.length,
                          itemBuilder: (context, index) {
                            final history = roomHistory[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildDetailRow("Room Name", roomName),
                                    _buildDetailRow("Pet Name",
                                        history['petName'] ?? "Unknown"),
                                    _buildDetailRow("Check-in Date",
                                        formatDate(history['bookingStartDate'])),
                                    _buildDetailRow("Check-out Date",
                                        formatDate(history['bookingEndDate'])),
                                    _buildDetailRow(
                                        "Status", history['status']),
                                  ],
                                ),
                              ),
                            );
                          },
                        )
                      : const Text("No room history found for this booking."),
                  const SizedBox(height: 20),
                  if (bookingStatusName == "Pending" ||
                      bookingStatusName == "Confirmed")
                    Center(
                      child: ElevatedButton(
                        onPressed: cancelBooking,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 12),
                          textStyle: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        child: const Text("Cancel Booking"),
                      ),
                    ),
                ],
              )
            : const Center(child: Text("No booking details found.")),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          Text(value, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
