import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'booking_service_choose.dart';

class BookingServiceForm extends StatefulWidget {
  final String? cusId;
  final Function(List<Map<String, dynamic>>) onBookingServiceDataChange;

  BookingServiceForm({required this.cusId, required this.onBookingServiceDataChange});

  @override
  _BookingServiceFormState createState() => _BookingServiceFormState();
}

class _BookingServiceFormState extends State<BookingServiceForm> {
  DateTime _selectedDate = DateTime.now();
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
  String? _selectedVoucherId;
  String? _voucherError;
  double _totalPrice = 0.0;
  double _finalDiscount = 0.0;
  double _discountedPrice = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchServices();
    _fetchPets();
    _fetchVouchers();
  }

  Future<void> _fetchServices() async {
    try {
      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/Service'),
        headers: {'Authorization': 'Bearer ${await _getToken()}'},
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
      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/pet/available/${widget.cusId}'),
        headers: {'Authorization': 'Bearer ${await _getToken()}'},
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

  Future<void> _fetchVouchers() async {
    try {
      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/Voucher/valid-voucher'),
        headers: {'Authorization': 'Bearer ${await _getToken()}'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag']) {
          setState(() {
            _vouchers = List<Map<String, dynamic>>.from(data['data']);
          });
        }
      }
    } catch (e) {
      print('Error fetching vouchers: $e');
    }
  }

  Future<String> _getToken() async {
    // Implement your token retrieval logic here
    return 'your-token';
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
          _selectedServices.add(serviceId);
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
          _selectedPets.add(petId);
        }
      }
    });
  }

  void _handleCreateBookingServices() {
    setState(() {
      _error = null;
      _bookingChoices = [];
    });

    // If "All" is selected for both services and pets
    if (_selectAllServices && _selectAllPets) {
      for (var service in _services) {
        for (var pet in _pets) {
          _bookingChoices.add({
            "service": service['serviceId'],
            "pet": pet['petId'],
            "price": 0.0,
            "serviceVariants": [],
            "serviceVariant": null,
          });
        }
      }
    }
    // If "All" is selected for services only
    else if (_selectAllServices) {
      for (var service in _services) {
        for (var petId in _selectedPets) {
          _bookingChoices.add({
            "service": service['serviceId'],
            "pet": petId,
            "price": 0.0,
            "serviceVariants": [],
            "serviceVariant": null,
          });
        }
      }
    }
    // If "All" is selected for pets only
    else if (_selectAllPets) {
      for (var serviceId in _selectedServices) {
        for (var pet in _pets) {
          _bookingChoices.add({
            "service": serviceId,
            "pet": pet['petId'],
            "price": 0.0,
            "serviceVariants": [],
            "serviceVariant": null,
          });
        }
      }
    }
    // If specific services and pets are selected
    else {
      for (var serviceId in _selectedServices) {
        for (var petId in _selectedPets) {
          _bookingChoices.add({
            "service": serviceId,
            "pet": petId,
            "price": 0.0,
            "serviceVariants": [],
            "serviceVariant": null,
          });
        }
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

    // Apply voucher discount if selected
    if (_selectedVoucherId != null) {
      final selectedVoucher = _vouchers.firstWhere(
        (v) => v['voucherId'].toString() == _selectedVoucherId,
        orElse: () => <String, dynamic>{}, // Return empty map instead of null
      );

      if (selectedVoucher.isNotEmpty) {
        if (_totalPrice >= (selectedVoucher['voucherMinimumSpend'] as num).toDouble()) {
          final discountAmount = (_totalPrice * (selectedVoucher['voucherDiscount'] as num).toDouble()) / 100;
          _finalDiscount = discountAmount.clamp(0.0, (selectedVoucher['voucherMaximum'] as num).toDouble());
          _discountedPrice = _totalPrice - _finalDiscount;
          _voucherError = null;
        } else {
          _voucherError = 'Minimum spend required: ${selectedVoucher['voucherMinimumSpend']} VND';
          _finalDiscount = 0;
          _discountedPrice = _totalPrice;
        }
      }
    } else {
      _finalDiscount = 0;
      _discountedPrice = _totalPrice;
    }
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
                  "Select Booking Date",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 10),
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
                    value: _selectedServices.contains(service['serviceId'].toString()),
                    onChanged: (bool? value) => _handleServiceSelect(service['serviceId'].toString()),
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
                    onChanged: (bool? value) => _handlePetSelect(pet['petId'].toString()),
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

        // Voucher Selection
        Card(
          margin: EdgeInsets.all(8),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select Voucher",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                DropdownButtonFormField<String>(
                  value: _selectedVoucherId,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    DropdownMenuItem(
                      value: null,
                      child: Text("None"),
                    ),
                    ..._vouchers.map((voucher) => DropdownMenuItem(
                      value: voucher['voucherId'].toString(),
                      child: Text(
                        "${voucher['voucherName']} - ${voucher['voucherCode']} (${voucher['voucherDiscount']}% Off, Max ${voucher['voucherMaximum']} VND)",
                      ),
                    )),
                  ],
                  onChanged: (String? value) {
                    setState(() {
                      _selectedVoucherId = value;
                      _calculateTotalPrice();
                    });
                  },
                ),
                if (_voucherError != null)
                  Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      _voucherError!,
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
              ],
            ),
          ),
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
