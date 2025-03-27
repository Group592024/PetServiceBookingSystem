import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class BookingRoomChoose extends StatefulWidget {
  final Map<String, dynamic> bookingData;
  final Function(Map<String, dynamic>) onBookingDataChange;
  final Map<String, dynamic> data;

  const BookingRoomChoose({
    Key? key,
    required this.bookingData,
    required this.onBookingDataChange,
    required this.data,
  }) : super(key: key);

  @override
  _BookingRoomChooseState createState() => _BookingRoomChooseState();
}

class _BookingRoomChooseState extends State<BookingRoomChoose> {
  List<Map<String, dynamic>> rooms = [];
  List<Map<String, dynamic>> pets = [];
  bool isLoading = true;
  String? error;
  Map<String, dynamic>? selectedRoomType;
  Map<String, dynamic> formData = {
    "room": "",
    "pet": "",
    "start": "",
    "end": "",
    "price": "0",
    "camera": false,
  };

  @override
  void initState() {
    super.initState();
    formData = {...widget.bookingData};
    fetchRoomsAndPets();
  }

  Future<void> fetchRoomsAndPets() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? accountId = prefs.getString('accountId');

      // Fetch rooms
      final roomResponse = await http.get(
        Uri.parse("http://127.0.0.1:5050/api/Room/available"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      
      if (roomResponse.statusCode == 200) {
        final roomData = jsonDecode(roomResponse.body);
        if (roomData["flag"]) {
          setState(() {
            rooms = List<Map<String, dynamic>>.from(roomData["data"]);
          });
          
          // If room is already selected, fetch its type
          if (formData["room"].isNotEmpty) {
            await _fetchRoomTypeForSelectedRoom();
          }
        }
      }

      // Fetch pets if customer ID exists
      if (widget.data["cusId"] != null) {
        final petResponse = await http.get(
          Uri.parse("http://127.0.0.1:5050/api/pet/available/${widget.data["cusId"]}"),
          headers: {
            "Authorization": "Bearer $token",
            "Content-Type": "application/json",
          },
        );
        
        if (petResponse.statusCode == 200) {
          final petData = jsonDecode(petResponse.body);
          if (petData["flag"]) {
            setState(() {
              pets = List<Map<String, dynamic>>.from(petData["data"]);
            });
          }
        }
      }
    } catch (e) {
      print('Error fetching data: $e');
      setState(() => error = "Error loading data. Please try again.");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _fetchRoomTypeForSelectedRoom() async {
    try {
      final selectedRoom = rooms.firstWhere(
        (room) => room["roomId"] == formData["room"],
        orElse: () => {},
      );
      
      if (selectedRoom.isNotEmpty && selectedRoom["roomTypeId"] != null) {
        await fetchRoomType(selectedRoom["roomTypeId"]);
      }
    } catch (e) {
      print('Error finding selected room: $e');
    }
  }

  Future<void> fetchRoomType(String roomTypeId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse("http://127.0.0.1:5050/api/RoomType/$roomTypeId"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data["flag"] && data["data"] != null) {
          setState(() {
            selectedRoomType = data["data"];
          });
          
          // Recalculate price if dates are already set
          if (formData["start"].isNotEmpty && formData["end"].isNotEmpty) {
            calculatePrice();
          }
        }
      }
    } catch (e) {
      print('Error fetching room type: $e');
      setState(() => error = "Error loading room details");
    }
  }

  Future<void> pickDateTime(String field) async {
    if (formData["room"].isEmpty) {
      setState(() => error = "Please select a room first");
      return;
    }

    final initialDate = field == "start" ? DateTime.now() : 
        (formData["start"].isNotEmpty ? DateTime.parse(formData["start"]) : DateTime.now());

    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: field == "start" ? DateTime.now() : DateTime.parse(formData["start"]),
      lastDate: DateTime.now().add(Duration(days: 365)),
    );

    if (pickedDate != null) {
      TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (pickedTime != null) {
        final fullDateTime = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );

        setState(() {
          formData[field] = fullDateTime.toIso8601String();
        });

        if (formData["start"].isNotEmpty && formData["end"].isNotEmpty) {
          calculatePrice();
        }
      }
    }
  }

  void calculatePrice() {
    if (selectedRoomType == null || 
        formData["start"].isEmpty || 
        formData["end"].isEmpty) {
      return;
    }

    try {
      final startDate = DateTime.parse(formData["start"]);
      final endDate = DateTime.parse(formData["end"]);

      if (startDate.isAfter(endDate)) {
        setState(() => error = "End date must be after start date");
        return;
      }

      final difference = endDate.difference(startDate);
      final daysDifference = difference.inHours > 0 
          ? (difference.inHours / 24).ceil()
          : 1;

      final roomPrice = double.tryParse(selectedRoomType!["price"].toString()) ?? 0.0;
      var totalPrice = roomPrice * daysDifference;

      if (formData["camera"] == true) {
        totalPrice += 50000;
      }

      setState(() {
        formData["price"] = totalPrice.toStringAsFixed(0);
        error = null;
      });

      widget.onBookingDataChange({
        ...formData,
        "price": totalPrice,
      });
    } catch (e) {
      print('Error calculating price: $e');
      setState(() => error = "Error calculating price");
    }
  }

  void handleChange(String field, dynamic value) {
    setState(() {
      formData[field] = value;
      error = null;
    });

    if (field == "room") {
      if (value != null) {
        final selectedRoom = rooms.firstWhere(
          (room) => room["roomId"] == value,
          orElse: () => {},
        );
        
        if (selectedRoom.isNotEmpty) {
          fetchRoomType(selectedRoom["roomTypeId"]);
        }
      }
    } else if (field == "camera") {
      if (selectedRoomType != null) {
        calculatePrice();
      }
    }

    widget.onBookingDataChange(formData);
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DropdownButtonFormField(
            decoration: InputDecoration(
              labelText: "Room",
              border: OutlineInputBorder(),
            ),
            value: formData["room"].isNotEmpty ? formData["room"] : null,
            onChanged: (value) => handleChange("room", value),
            items: rooms.map((room) {
              return DropdownMenuItem(
                value: room["roomId"],
                child: Text("${room["roomName"]} - ${room["description"]}"),
              );
            }).toList(),
            validator: (value) => value == null ? 'Please select a room' : null,
          ),
          SizedBox(height: 10),
          DropdownButtonFormField(
            decoration: InputDecoration(
              labelText: "Pet",
              border: OutlineInputBorder(),
            ),
            value: formData["pet"].isNotEmpty ? formData["pet"] : null,
            onChanged: (value) => handleChange("pet", value),
            items: pets.map((pet) {
              return DropdownMenuItem(
                value: pet["petId"],
                child: Text(pet["petName"]),
              );
            }).toList(),
            validator: (value) => value == null ? 'Please select a pet' : null,
          ),
          SizedBox(height: 10),
          InkWell(
            onTap: () => pickDateTime("start"),
            child: InputDecorator(
              decoration: InputDecoration(
                labelText: "Start Date & Time",
                border: OutlineInputBorder(),
              ),
              child: Text(
                formData["start"].isNotEmpty
                    ? DateTime.parse(formData["start"]).toString()
                    : "Select Date & Time",
              ),
            ),
          ),
          SizedBox(height: 10),
          InkWell(
            onTap: () => pickDateTime("end"),
            child: InputDecorator(
              decoration: InputDecoration(
                labelText: "End Date & Time",
                border: OutlineInputBorder(),
              ),
              child: Text(
                formData["end"].isNotEmpty
                    ? DateTime.parse(formData["end"]).toString()
                    : "Select Date & Time",
              ),
            ),
          ),
          SizedBox(height: 10),
          CheckboxListTile(
            title: Text("Camera (+50,000 VND)"),
            value: formData["camera"] ?? false,
            onChanged: (bool? value) {
              handleChange("camera", value ?? false);
            },
            controlAffinity: ListTileControlAffinity.leading,
          ),
          if (error != null)
            Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text(
                error!,
                style: TextStyle(color: Colors.red),
              ),
            ),
          SizedBox(height: 10),
          Text(
            "Total Price: ${formData["price"]} VND",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
        ],
      ),
    );
  }
}