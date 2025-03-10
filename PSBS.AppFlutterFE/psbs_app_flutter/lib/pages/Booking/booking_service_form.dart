import 'package:flutter/material.dart';
import 'booking_service_choose.dart';

class BookingServiceForm extends StatefulWidget {
  final String? cusId;

   BookingServiceForm({required this.cusId}); 

  @override
  _BookingServiceFormState createState() => _BookingServiceFormState();
}

class _BookingServiceFormState extends State<BookingServiceForm> {
  DateTime _selectedDate = DateTime.now();
  List<Map<String, dynamic>> _bookingChoices = [];

  void _addNewBookingChoice() {
    if (widget.cusId == null) {
      print("Customer ID not available");
      return;
    }
    setState(() {
      _bookingChoices.add({
        "service": null,
        "serviceVariants": [],
        "serviceVariant": null,
        "pet": null,
        "price": 0.0,
      });
    });
  }

  void _removeBookingChoice(int index) {
    setState(() {
      _bookingChoices.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Select Booking Date
        Text("Select Booking Date:"),
        ElevatedButton(
          onPressed: () async {
            DateTime? picked = await showDatePicker(
              context: context,
              initialDate: _selectedDate,
              firstDate: DateTime.now(),
              lastDate: DateTime(2100),
            );
            if (picked != null) {
              setState(() {
                _selectedDate = picked;
              });
            }
          },
          child: Text("${_selectedDate.toLocal()}".split(' ')[0]),
        ),

        SizedBox(height: 10),

        // Add Booking Choice Button
        ElevatedButton(
          onPressed: _addNewBookingChoice,
          child: Text("New Booking Service"),
        ),

        SizedBox(height: 10),

        // Booking Choices List
        BookingServiceChoice(
          cusId: widget.cusId ?? "", 
          bookingChoices: _bookingChoices,
          onRemove: _removeBookingChoice,
        ),
      ],
    );
  }
}
