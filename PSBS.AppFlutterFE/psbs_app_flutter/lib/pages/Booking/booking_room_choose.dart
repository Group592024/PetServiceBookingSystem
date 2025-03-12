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
    "price": "",
    "camera": false,
  };

  @override
  void initState() {
    super.initState();
    formData = widget.bookingData;
    fetchRoomsAndPets();
  }

  Future<void> fetchRoomsAndPets() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? accountId = prefs.getString('accountId');

      final roomResponse = await http.get(
        Uri.parse("http://127.0.0.1:5023/api/Room/available"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final roomData = jsonDecode(roomResponse.body);
      if (roomData["flag"]) {
        setState(() {
          rooms = List<Map<String, dynamic>>.from(roomData["data"]);
        });
      } else {
        setState(() => error = "Failed to fetch rooms.");
      }
      print("Customer ID: ${widget.data['cusId']}");

      if (widget.data["cusId"] != null) {
        final petResponse = await http.get(
          Uri.parse(
              "http://127.0.0.1:5010/api/pet/available/${widget.data["cusId"]}"),
          headers: {
            "Authorization": "Bearer $token",
            "Content-Type": "application/json",
          },
        );
        final petData = jsonDecode(petResponse.body);
        if (petData["flag"]) {
          setState(() {
            pets = List<Map<String, dynamic>>.from(petData["data"]);
          });
        } else {
          setState(() => error = "Failed to fetch pets.");
        }
        print("Pets Loaded: $pets");
      } else {
        print("Khong co cusId ");
      }
    } catch (e) {
      setState(() => error = "Error fetching data.");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> fetchRoomType(String roomTypeId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://127.0.0.1:5023/api/RoomType/$roomTypeId"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      final data = jsonDecode(response.body);
      if (data["flag"] && data["data"] != null) {
        setState(() {
          selectedRoomType = data["data"];
          formData["price"] =
              selectedRoomType!["price"].toString(); 
          calculatePrice();
        });
      } else {
        setState(() => error = "Failed to fetch room type.");
      }
    } catch (e) {
      setState(() => error = "Error fetching room type.");
    }
  }

  Future<void> pickDateTime(String field) async {
  print("Opening date picker for $field");
  DateTime now = DateTime.now();
  DateTime? pickedDate = await showDatePicker(
    context: context,
    initialDate: now,
    firstDate: now,
    lastDate: DateTime(now.year + 5),
  );

  if (pickedDate != null) {
    TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (pickedTime != null) {
      DateTime fullDateTime = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );

      setState(() {
        formData[field] = fullDateTime.toIso8601String();
      });

      widget.onBookingDataChange({...formData});

      calculatePrice(); 
    }
  }
}


  void calculatePrice() {
  if (formData["start"].isNotEmpty &&
      formData["end"].isNotEmpty &&
      selectedRoomType != null) {
    DateTime startDate = DateTime.parse(formData["start"]);
    DateTime endDate = DateTime.parse(formData["end"]);

    if (startDate.isAfter(endDate)) {
      setState(() => error = "End date must be after start date.");
      return;
    }

    setState(() => error = null);

    int daysDifference = endDate.difference(startDate).inDays + 1; // Ensures at least 1 day
    double roomPrice = selectedRoomType!["price"] ?? 0; 
    double totalPrice = roomPrice * daysDifference;

    if (formData["camera"] == true) {
      totalPrice += 50000;
    }

    setState(() {
      formData["price"] = totalPrice.toString();
    });

    widget.onBookingDataChange({...formData, "price": totalPrice});
  }
}


  void handleChange(String field, dynamic value) {
    setState(() {
      formData[field] = value;
    });

    if (field == "room") {
      String roomTypeId =
          rooms.firstWhere((room) => room["roomId"] == value)["roomTypeId"];
      fetchRoomType(roomTypeId);
    }

    widget.onBookingDataChange(formData);
  }

  @override
  Widget build(BuildContext context) {
    return isLoading
        ? Center(child: CircularProgressIndicator())
        : Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(color: Colors.black12, blurRadius: 5),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField(
                  decoration: InputDecoration(
                      labelText: "Room", border: OutlineInputBorder()),
                  value: formData["room"].isNotEmpty ? formData["room"] : null,
                  onChanged: (value) => handleChange("room", value),
                  items: rooms.map((room) {
                    return DropdownMenuItem(
                        value: room["roomId"],
                        child: Text(
                            "${room["roomName"]} - ${room["description"]}"));
                  }).toList(),
                ),
                SizedBox(height: 10),
                DropdownButtonFormField(
                  decoration: InputDecoration(
                      labelText: "Pet", border: OutlineInputBorder()),
                  value: formData["pet"].isNotEmpty ? formData["pet"] : null,
                  onChanged: (value) => handleChange("pet", value),
                  items: pets.map((pet) {
                    return DropdownMenuItem(
                        value: pet["petId"], child: Text("${pet["petName"]}"));
                  }).toList(),
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
                          ? formData["start"]
                          : "Select Date & Time",
                      style: TextStyle(color: Colors.black),
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
                          ? formData["end"]
                          : "Select Date & Time",
                      style: TextStyle(color: Colors.black),
                    ),
                  ),
                ),
                SizedBox(height: 10),
                CheckboxListTile(
                  title: Text("Camera (+50,000 VND)"),
                  value: formData["camera"],
                  onChanged: (bool? value) {
                    handleChange("camera", value ?? false);
                    calculatePrice(); 
                  },
                  controlAffinity: ListTileControlAffinity.leading,
                ),
                SizedBox(height: 10),
                Text(
                  "Total Price: ${formData["price"]} VND",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          );
  }
}
