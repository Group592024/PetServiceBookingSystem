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
  double _totalPrice = 0.0;


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
    _calculateTotalPrice();
    _notifyParent();
  });
}

void _calculateTotalPrice() {
  _totalPrice = _bookingRooms.fold(0.0, (sum, room) {
    double price = double.tryParse(room["price"].toString()) ?? 0.0;
    return sum + price;
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
      SizedBox(height: 20),
      Text(
        "Total Price: $_totalPrice",
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    ],
  );
}

}
