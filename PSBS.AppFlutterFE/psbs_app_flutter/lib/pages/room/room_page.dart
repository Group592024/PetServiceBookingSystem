import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/pages/room/room_detail.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RoomPage extends StatefulWidget {
  const RoomPage({super.key});

  @override
  _RoomPageState createState() => _RoomPageState();
}

class _RoomPageState extends State<RoomPage> {
  List<dynamic> rooms = [];
  List<dynamic> roomTypes = [];
  bool isLoading = true;
  bool isGridView = false;

  // Fetch rooms and room types data
  Future<void> fetchRooms() async {
    setState(() {
      isLoading = true;
    });

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString("token");

      if (token == null || token.isEmpty) {
        throw Exception("Token does not exist. Please log in again.");
      }

      final responseRooms = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Room/available'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      final responseTypes = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/RoomType'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (responseRooms.statusCode == 200 && responseTypes.statusCode == 200) {
        final dataRooms = json.decode(responseRooms.body);
        final dataTypes = json.decode(responseTypes.body);

        setState(() {
          rooms = dataRooms['data'] ?? [];
          roomTypes = dataTypes['data'] ?? [];
          isLoading = false;
        });
      } else if (responseRooms.statusCode == 404) {
        setState(() {
          rooms = [];
          isLoading = false;
        });
        print("No available rooms.");
      } else {
        throw Exception('Failed to load rooms.');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      print('Error fetching data: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    fetchRooms();
  }

  // Function to get room type name by ID
  String getRoomTypeName(String roomTypeId) {
    final roomType = roomTypes.firstWhere(
      (type) => type['roomTypeId'].toString() == roomTypeId.toString(),
      orElse: () => {},
    );
    return roomType.isNotEmpty ? roomType['name'] ?? 'Unknown' : 'Unknown';
  }

  // Function to get room type price by ID
  String getRoomTypePrice(String roomTypeId) {
    final roomType = roomTypes.firstWhere(
        (type) => type['roomTypeId'] == roomTypeId,
        orElse: () => null);
    return roomType != null ? '${roomType['price']} VND' : 'N/A';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            pinned: true,
            backgroundColor: Colors.blue,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'Pet Rooms',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                    colors: [Colors.blue.shade300, Colors.blue.shade700],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  isGridView ? Icons.view_list : Icons.grid_view,
                  color: Colors.white,
                ),
                onPressed: () {
                  setState(() {
                    isGridView = !isGridView;
                  });
                },
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: isLoading
                ? Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(color: Colors.blue),
                    ),
                  )
                : rooms.isEmpty
                    ? _buildEmptyState()
                    : isGridView
                        ? _buildGridView()
                        : Padding(
                            padding: EdgeInsets.all(16),
                            child: ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: rooms.length,
                              itemBuilder: (context, index) {
                                final room = rooms[index];
                                return _buildRoomCard(context, room);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.hotel,
            size: 80,
            color: Colors.blue.withOpacity(0.5),
          ),
          SizedBox(height: 16),
          Text(
            'No Rooms Available',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.blue.shade800,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Check back later for available rooms',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRoomCard(BuildContext context, Map<String, dynamic> room) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image with Status Badge
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  'http://10.0.2.2:5050/facility-service${room['roomImage']}',
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.contain,
                ),
              ),
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(room['status']).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                      SizedBox(width: 6),
                      Text(
                        room['status'],
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Room Information
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            room['roomName'],
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade800,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            getRoomTypeName(room['roomTypeId']),
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        getRoomTypePrice(room['roomTypeId']),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CustomerRoomDetail(
                            roomId: room['roomId'],
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'View Details',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward, size: 20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView() {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      padding: EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.6,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: rooms.length,
      itemBuilder: (context, index) {
        final room = rooms[index];
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                flex: 4,
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(20)),
                      child: Image.network(
                        'http://10.0.2.2:5050/facility-service${room['roomImage']}',
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color:
                              _getStatusColor(room['status']).withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                            ),
                            SizedBox(width: 4),
                            Text(
                              room['status'],
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 4,
                child: Padding(
                  padding: EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        room['roomName'],
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade800,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 2),
                      Text(
                        getRoomTypeName(room['roomTypeId']),
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4),
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          getRoomTypePrice(room['roomTypeId']),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue.shade700,
                          ),
                        ),
                      ),
                      SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => CustomerRoomDetail(
                                  roomId: room['roomId'],
                                ),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            elevation: 0,
                          ),
                          child: Text(
                            'View Details',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Free':
        return Colors.green;
      case 'In Use':
        return Colors.orange;
      default:
        return Colors.red;
    }
  }
}
