import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'booking_service_choose.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BookingServiceForm extends StatefulWidget {
  final String? cusId;
  final Function(List<Map<String, dynamic>>) onBookingServiceDataChange;

  BookingServiceForm(
      {required this.cusId, required this.onBookingServiceDataChange});

  @override
  _BookingServiceFormState createState() => _BookingServiceFormState();
}

class _BookingServiceFormState extends State<BookingServiceForm> {
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();
  List<Map<String, dynamic>> _bookingChoices = [];
  List<Map<String, dynamic>> _services = [];
  List<Map<String, dynamic>> _pets = [];
  List<String> _selectedServices = [];
  List<String> _selectedPets = [];
  bool _selectAllServices = false;
  bool _selectAllPets = false;
  String? _error;
  Map<String, String> _petNames = {};
  List<Map<String, dynamic>> _vouchers = [];
  String? _voucherError;
  double _totalPrice = 0.0;
  double _finalDiscount = 0.0;
  double _discountedPrice = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchServices();
    _fetchPets();
  }

  Future<void> _fetchServices() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/Service'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag']) {
          setState(() {
            _services = List<Map<String, dynamic>>.from(data['data']);
          });
        }
      }
    } catch (e) {
      print('Error fetching services: $e');
    }
  }

  Future<void> _fetchPets() async {
    if (widget.cusId == null) return;
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/pet/available/${widget.cusId}'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag']) {
          setState(() {
            _pets = List<Map<String, dynamic>>.from(data['data']);
            // Initialize pet names
            for (var pet in _pets) {
              _petNames[pet['petId']] = pet['petName'];
            }
          });
        }
      }
    } catch (e) {
      print('Error fetching pets: $e');
    }
  }

  void _handleServiceSelect(String serviceId) {
    setState(() {
      if (serviceId == 'all') {
        _selectAllServices = !_selectAllServices;
        if (_selectAllServices) {
          _selectedServices = _services.map((s) => s['serviceId'].toString()).toList();
        } else {
          _selectedServices = [];
        }
      } else {
        _selectAllServices = false;
        if (_selectedServices.contains(serviceId)) {
          _selectedServices.remove(serviceId);
        } else {
          _selectedServices.add(serviceId.toString());
        }
      }
    });
  }

  void _handlePetSelect(String petId) {
    setState(() {
      if (petId == 'all') {
        _selectAllPets = !_selectAllPets;
        if (_selectAllPets) {
          _selectedPets = _pets.map((p) => p['petId'].toString()).toList();
        } else {
          _selectedPets = [];
        }
      } else {
        _selectAllPets = false;
        if (_selectedPets.contains(petId)) {
          _selectedPets.remove(petId);
        } else {
          _selectedPets.add(petId.toString());
        }
      }
    });
  }

  Future<void> _selectDateTime() async {
    // First select date
    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );

    if (pickedDate != null) {
      // Then select time
      TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: _selectedTime,
      );

      if (pickedTime != null) {
        // Combine date and time
        DateTime fullDateTime = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );

        // Validate if selected time is at least 1 hour after current time
        if (fullDateTime.isBefore(DateTime.now().add(Duration(hours: 1)))) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Please select a time at least 1 hour from now'),
              backgroundColor: Colors.red,
            ),
          );
          return;
        }

        setState(() {
          _selectedDate = fullDateTime;
          _selectedTime = pickedTime;
        });
      }
    }
  }

  void _handleCreateBookingServices() {
    setState(() {
      _error = null;
      _bookingChoices = [];
    });

    // Validate if date is selected
    if (_selectedDate.isBefore(DateTime.now().add(Duration(hours: 1)))) {
      setState(() {
        _error = 'Please select a valid booking date and time (at least 1 hour from now)';
      });
      return;
    }

    // Get the list of selected services
    List<Map<String, dynamic>> servicesToBook;
    if (_selectAllServices) {
      servicesToBook = _services;
    } else {
      servicesToBook = _services.where((s) => _selectedServices.contains(s['serviceId'].toString())).toList();
    }

    // Get the list of selected pets
    List<Map<String, dynamic>> petsToBook;
    if (_selectAllPets) {
      petsToBook = _pets;
    } else {
      petsToBook = _pets.where((p) => _selectedPets.contains(p['petId'].toString())).toList();
    }

    // Validate if any services or pets are selected
    if (servicesToBook.isEmpty || petsToBook.isEmpty) {
      setState(() {
        _error = 'Please select at least one service and one pet';
      });
      return;
    }

    // Create booking choices for each pet with all selected services
    for (var pet in petsToBook) {
      for (var service in servicesToBook) {
        _bookingChoices.add({
          "service": service['serviceId'].toString(),
          "pet": pet['petId'].toString(),
          "price": 0.0,
          "serviceVariants": [],
          "serviceVariant": null,
        });
      }
    }

    _updateBookingServiceData();
  }

  void _updateBookingServiceData() {
    widget.onBookingServiceDataChange(_bookingChoices);
  }

  void _removeBookingChoice(int index) {
    setState(() {
      _bookingChoices.removeAt(index);
    });
    _updateBookingServiceData();
  }

  void _updateBookingChoice(int index, Map<String, dynamic> newData) {
    setState(() {
      _bookingChoices[index] = newData;
      _calculateTotalPrice();
    });
    _updateBookingServiceData();
  }

  void _calculateTotalPrice() {
    _totalPrice = _bookingChoices.fold(0.0, (sum, choice) {
      double price = double.tryParse(choice["price"].toString()) ?? 0.0;
      return sum + price;
    });

  }

  void _notifyParent() {
    widget.onBookingServiceDataChange(_bookingChoices);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Date Selection
        Card(
          margin: EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select Booking Date & Time",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _selectDateTime,
                  child: Text(
                    "${_selectedDate.toLocal().toString().split('.')[0]}",
                  ),
                ),
                if (_selectedDate.isBefore(DateTime.now().add(Duration(hours: 1))))
                  Text(
                    "Please select a time at least 1 hour from now",
                    style: TextStyle(color: Colors.red),
                  ),
              ],
            ),
          ),
        ),

        // Services Selection
        Card(
          margin: EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select Services",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                CheckboxListTile(
                  title: Text("All Services"),
                  value: _selectAllServices,
                  onChanged: (bool? value) => _handleServiceSelect('all'),
                ),
                if (!_selectAllServices)
                  ..._services.map((service) => CheckboxListTile(
                        title: Text(service['serviceName']),
                        value: _selectedServices
                            .contains(service['serviceId'].toString()),
                        onChanged: (bool? value) => _handleServiceSelect(
                            service['serviceId'].toString()),
                      )),
              ],
            ),
          ),
        ),

        // Pets Selection
        Card(
          margin: EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select Pets",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                CheckboxListTile(
                  title: Text("All Pets"),
                  value: _selectAllPets,
                  onChanged: (bool? value) => _handlePetSelect('all'),
                ),
                if (!_selectAllPets)
                  ..._pets.map((pet) => CheckboxListTile(
                        title: Text(pet['petName']),
                        value: _selectedPets.contains(pet['petId'].toString()),
                        onChanged: (bool? value) =>
                            _handlePetSelect(pet['petId'].toString()),
                      )),
              ],
            ),
          ),
        ),

        if (_error != null)
          Padding(
            padding: EdgeInsets.all(8),
            child: Text(
              _error!,
              style: TextStyle(color: Colors.red),
            ),
          ),

        ElevatedButton(
          onPressed: _handleCreateBookingServices,
          child: Text("Create Booking Services"),
        ),

        // Booking Choices List
        ..._bookingChoices.asMap().entries.map((entry) {
          int index = entry.key;
          return Card(
            margin: EdgeInsets.symmetric(vertical: 8),
            child: Column(
              children: [
                ListTile(
                  title: Text("Service Booking #${index + 1}"),
                  trailing: IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _removeBookingChoice(index),
                  ),
                ),
                BookingServiceChoice(
                  cusId: widget.cusId ?? "",
                  bookingChoices: [_bookingChoices[index]],
                  onRemove: (index) => _removeBookingChoice(index),
                  onUpdate: () => _notifyParent(),
                ),
              ],
            ),
          );
        }).toList(),

        // Price Summary
        Card(
          margin: EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Price Summary",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 10),
                Text("Original Price: ${_totalPrice.toStringAsFixed(2)} VND"),
                if (_finalDiscount > 0)
                  Text(
                    "Discount: -${_finalDiscount.toStringAsFixed(2)} VND",
                    style: TextStyle(color: Colors.green),
                  ),
                Text(
                  "Total Price: ${_discountedPrice.toStringAsFixed(2)} VND",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
