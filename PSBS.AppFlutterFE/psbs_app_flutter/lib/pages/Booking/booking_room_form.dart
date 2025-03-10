import 'package:flutter/material.dart';
import 'booking_room_choose.dart';

class BookingRoomForm extends StatefulWidget {
  final String? cusId;
  final Function(List<Map<String, dynamic>>)? onBookingDataChange;

  BookingRoomForm({
    required this.cusId,
    this.onBookingDataChange,
  });

  @override
  _BookingRoomFormState createState() => _BookingRoomFormState();
}

class _BookingRoomFormState extends State<BookingRoomForm> {
  List<Map<String, dynamic>> _bookingRooms = [];

  void _addNewBookingRoom() {
    if (widget.cusId == null) {
      print("Customer ID not available");
      return;
    }
    setState(() {
      _bookingRooms.add({
        "room": "",
        "pet": "",
        "start": "",
        "end": "",
        "price": "",
        "camera": false,
      });
      _notifyParent();
    });
  }

  void _removeBookingRoom(int index) {
    setState(() {
      _bookingRooms.removeAt(index);
      _notifyParent();
    });
  }

  void _updateBookingData(int index, Map<String, dynamic> newData) {
    setState(() {
      _bookingRooms[index] = newData;
      _notifyParent();
    });
  }

  void _notifyParent() {
    if (widget.onBookingDataChange != null) {
      widget.onBookingDataChange!(_bookingRooms);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: _addNewBookingRoom,
          child: Text("New Booking Room"),
        ),
        ..._bookingRooms.asMap().entries.map((entry) {
          int index = entry.key;
          return Card(
            margin: EdgeInsets.symmetric(vertical: 8),
            child: Column(
              children: [
                ListTile(
                  title: Text("Room Booking #${index + 1}"),
                  trailing: IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _removeBookingRoom(index),
                  ),
                ),
                BookingRoomChoose(
                  bookingData: _bookingRooms[index],
                  onBookingDataChange: (data) => _updateBookingData(index, data),
                  data: {"cusId": widget.cusId},
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }
}
