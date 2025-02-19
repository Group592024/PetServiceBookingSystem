import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/pages/room/room_detail.dart';

class RoomPage extends StatefulWidget {
  const RoomPage({super.key});

  @override
  _RoomPageState createState() => _RoomPageState();
}

class _RoomPageState extends State<RoomPage> {
  List<dynamic> rooms = [];
  List<dynamic> roomTypes = [];
  bool isLoading = true;

  // Fetch rooms and room types data
  Future<void> fetchRooms() async {
    try {
      final responseRooms =
          await http.get(Uri.parse('http://10.0.2.2:5023/api/Room/available'));
      final responseTypes =
          await http.get(Uri.parse('http://10.0.2.2:5023/api/RoomType'));

      if (responseRooms.statusCode == 200 && responseTypes.statusCode == 200) {
        final dataRooms = json.decode(responseRooms.body);
        final dataTypes = json.decode(responseTypes.body);

        setState(() {
          rooms = dataRooms['data'];
          roomTypes = dataTypes['data'];
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load rooms and room types');
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
      appBar: AppBar(
        title: Text('Rooms for Your Pets'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: isLoading
            ? Center(child: CircularProgressIndicator())
            : rooms.isEmpty
                ? Center(child: Text('No rooms available'))
                : GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 1,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: rooms.length,
                    itemBuilder: (context, index) {
                      final room = rooms[index];
                      return Card(
                        elevation: 5,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Image.network(
                                'http://10.0.2.2:5023${room['roomImage']}',
                                height: 200,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              ),
                              SizedBox(height: 10),
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            room['roomName'],
                                            style: TextStyle(
                                              fontSize: 25,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          SizedBox(height: 8),
                                          Container(
                                            padding: EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: room['status'] == 'Free'
                                                  ? Colors.green[100]
                                                  : room['status'] == 'In Use'
                                                      ? Colors.orange[100]
                                                      : Colors.red[100],
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              room['status'],
                                              style: TextStyle(
                                                fontSize: 20,
                                                fontWeight: FontWeight.bold,
                                                color: room['status'] == 'Free'
                                                    ? Colors.green
                                                    : room['status'] == 'In Use'
                                                        ? Colors.orange
                                                        : Colors.red,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            getRoomTypeName(room['roomTypeId']),
                                            style: TextStyle(
                                              fontSize: 25,
                                              fontWeight: FontWeight.w500,
                                              color: Colors.black,
                                            ),
                                          ),
                                          SizedBox(height: 8),
                                          Text(
                                            getRoomTypePrice(
                                                room['roomTypeId']),
                                            style: TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.green,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 10),
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: ElevatedButton(
                                  onPressed: () {
                                    // Navigate to room detail page
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            CustomerRoomDetail(
                                          roomId: room[
                                              'roomId'], // Pass the correct room ID
                                        ),
                                      ),
                                    );
                                  },
                                  style: ButtonStyle(
                                    backgroundColor:
                                        WidgetStateProperty.all(Colors.yellow),
                                    foregroundColor:
                                        WidgetStateProperty.all(Colors.black),
                                  ),
                                  child: Text(
                                    'See More',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
