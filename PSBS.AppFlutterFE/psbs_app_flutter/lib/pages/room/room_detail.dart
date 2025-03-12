import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CustomerRoomDetail extends StatefulWidget {
  final String roomId;

  const CustomerRoomDetail({super.key, required this.roomId});

  @override
  _CustomerRoomDetailState createState() => _CustomerRoomDetailState();
}

class _CustomerRoomDetailState extends State<CustomerRoomDetail> {
  bool loading = true;
  bool showFullDescription = false;
  Map<String, dynamic> detail = {};
  String roomTypeName = '';
  String roomTypePrice = '';

  @override
  void initState() {
    super.initState();
    fetchDetail();
  }

  Future<void> fetchDetail() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString("token");

      final Map<String, String> headers = {
        "Content-Type": "application/json",
        if (token != null) "Authorization": "Bearer $token",
      };

      final roomResponse = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Room/${widget.roomId}'),
        headers: headers,
      );

      if (roomResponse.statusCode != 200) {
        throw Exception('Failed to load room details');
      }

      final roomData = json.decode(roomResponse.body);
      setState(() {
        detail = roomData['data'];
      });

      if (detail.isNotEmpty && detail['roomTypeId'] != null) {
        final roomTypeResponse = await http.get(
          Uri.parse(
              'http://10.0.2.2:5050/api/RoomType/${detail['roomTypeId']}'),
          headers: headers,
        );

        if (roomTypeResponse.statusCode != 200) {
          throw Exception('Failed to load room type');
        }

        final roomTypeData = json.decode(roomTypeResponse.body);
        setState(() {
          roomTypeName = roomTypeData['data']['name'];
          roomTypePrice = roomTypeData['data']['price'].toString();
        });
      }
    } catch (e) {
      print('Error fetching data: $e');
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Room Details'),
        backgroundColor: Colors.blue,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Room Details
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Room Image
                          Image.network(
                            'http://10.0.2.2:5050/facility-service${detail['roomImage']}',
                            width: double.infinity,
                            height: 300,
                            fit: BoxFit.cover,
                          ),
                          SizedBox(height: 25),
                          // Room Name and Price in one row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Room Name
                              Text(
                                detail['roomName'] ?? '',
                                style: TextStyle(
                                    fontSize: 30, fontWeight: FontWeight.bold),
                              ),
                              // Price
                              Text(
                                'Price: $roomTypePrice VND',
                                style: TextStyle(
                                  color: Colors.green,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 15),
                          // Room Type and Status in another row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Room Type Name
                              Text(
                                'Type: $roomTypeName',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              // Room Status
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: getStatusColor(detail['status']),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  detail['status'] ?? '',
                                  style: TextStyle(
                                    color: getStatusTextColor(detail['status']),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 20),
                          // Book Now Button in a separate row
                          Center(
                            child: SizedBox(
                              width: 300,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pushNamed(context, '/booking');
                                },
                                style: ButtonStyle(
                                  backgroundColor: WidgetStateProperty.all(
                                      Colors.yellow[600]),
                                ),
                                child: Text(
                                  'Book Now',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 20),
                          // Description
                          Text(
                            'Description',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 8),
                          Text(
                            detail['description'] ?? '',
                            maxLines: showFullDescription ? null : 7,
                            overflow: showFullDescription
                                ? TextOverflow.visible
                                : TextOverflow.ellipsis,
                            style: TextStyle(color: Colors.grey[700]),
                          ),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                showFullDescription = !showFullDescription;
                              });
                            },
                            child: Text(
                              showFullDescription ? 'Show Less' : 'See More',
                              style: TextStyle(color: Colors.blue),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Color getStatusColor(String? status) {
    if (status == 'Free') {
      return Colors.green[100]!;
    } else if (status == 'In Use') {
      return Colors.orange[100]!;
    } else {
      return Colors.red[100]!;
    }
  }

  Color getStatusTextColor(String? status) {
    if (status == 'Free') {
      return Colors.green[600]!;
    } else if (status == 'In Use') {
      return Colors.orange[600]!;
    } else {
      return Colors.red[600]!;
    }
  }
}
