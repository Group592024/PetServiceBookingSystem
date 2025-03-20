import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'booking_room_choose.dart';
import 'booking_service_choose.dart';

class BookingForm extends StatefulWidget {
  const BookingForm({Key? key}) : super(key: key);

  @override
  _BookingFormState createState() => _BookingFormState();
}

class _BookingFormState extends State<BookingForm> {
  int _currentStep = 0;
  String? _selectedOption;
  Map<String, dynamic> _formData = {};
  List<Map<String, dynamic>> _bookingRooms = [];
  List<Map<String, dynamic>> _bookingServices = [];
  String? _bookingServicesDate;
  String? _voucherId;
  double _totalPrice = 0;
  double _finalDiscount = 0;
  double _discountedPrice = 0;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? accountId = prefs.getString('accountId');

      if (token == null || accountId == null) {
        throw Exception('No token or accountId found');
      }

      final response = await http.get(
        Uri.parse('http://127.0.0.1:5050/api/Account?AccountId=$accountId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _formData = {
            'cusId': accountId,
            'name': data['accountName'] ?? '',
            'address': data['accountAddress'] ?? '',
            'phone': data['accountPhoneNumber'] ?? '',
            'note': '',
            'paymentMethod': '',
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error fetching user data: $e';
        _isLoading = false;
      });
    }
  }

  void _handleOptionSelect(String option) {
    setState(() {
      _selectedOption = option;
    });
  }

  void _handleNext() async {
    if (_currentStep == 0 && _selectedOption == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a booking type')),
      );
      return;
    }

    if (_currentStep == 1) {
      if (_selectedOption == 'Room' && _bookingRooms.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please add at least one booking room')),
        );
        return;
      }

      if (_selectedOption == 'Service' && _bookingServices.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please add at least one booking service')),
        );
        return;
      }
    }

    if (_currentStep == 2 && _formData['paymentMethod'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a payment method')),
      );
      return;
    }

    if (_currentStep < 3) {
      setState(() {
        _currentStep++;
      });
    } else {
      await _submitBooking();
    }
  }

  void _handleBack() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  Future<void> _submitBooking() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      Map<String, dynamic> requestData = {
        'customer': _formData,
        'selectedOption': _selectedOption,
        'voucherId': _voucherId ?? '00000000-0000-0000-0000-000000000000',
        'totalPrice': _totalPrice,
        'discountedPrice': _discountedPrice,
      };

      if (_selectedOption == 'Room') {
        requestData['bookingRooms'] = _bookingRooms;
      } else {
        requestData['services'] = _bookingServices;
        requestData['bookingServicesDate'] = _bookingServicesDate;
      }

      final response = await http.post(
        Uri.parse('http://127.0.0.1:5050/Bookings/${_selectedOption?.toLowerCase()}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(requestData),
      );

      final result = json.decode(response.body);
      if (result['flag']) {
        Navigator.pushReplacementNamed(context, '/bookings');
      } else {
        throw Exception(result['message'] ?? 'Failed to submit booking');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit booking: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('New Booking'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : Stepper(
                  currentStep: _currentStep,
                  onStepContinue: _handleNext,
                  onStepCancel: _handleBack,
                  controlsBuilder: (context, details) {
                    return Padding(
                      padding: const EdgeInsets.only(top: 16.0),
                      child: Row(
                        children: [
                          if (_currentStep > 0)
                            ElevatedButton(
                              onPressed: _handleBack,
                              child: Text('Back'),
                            ),
                          SizedBox(width: 16),
                          ElevatedButton(
                            onPressed: _handleNext,
                            child: Text(_currentStep == 3 ? 'Finish' : 'Next'),
                          ),
                        ],
                      ),
                    );
                  },
                  steps: [
                    Step(
                      title: Text('Booking Type'),
                      content: _buildBookingTypeStep(),
                      isActive: _currentStep >= 0,
                    ),
                    Step(
                      title: Text('Booking Details'),
                      content: _buildBookingDetailsStep(),
                      isActive: _currentStep >= 1,
                    ),
                    Step(
                      title: Text('Payment Information'),
                      content: _buildPaymentStep(),
                      isActive: _currentStep >= 2,
                    ),
                    Step(
                      title: Text('Confirm Booking'),
                      content: _buildConfirmStep(),
                      isActive: _currentStep >= 3,
                    ),
                  ],
                ),
    );
  }

  Widget _buildBookingTypeStep() {
    return Column(
      children: [
        Text(
          'Choose Service',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildOptionCard(
              'Room',
              Icons.hotel,
              _selectedOption == 'Room',
            ),
            _buildOptionCard(
              'Service',
              Icons.local_laundry_service,
              _selectedOption == 'Service',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOptionCard(String title, IconData icon, bool isSelected) {
    return GestureDetector(
      onTap: () => _handleOptionSelect(title),
      child: Card(
        elevation: isSelected ? 8 : 2,
        color: isSelected ? Colors.blue : Colors.white,
        child: Container(
          width: 150,
          padding: EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 48, color: isSelected ? Colors.white : Colors.blue),
              SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBookingDetailsStep() {
    return _selectedOption == 'Room'
        ? BookingRoomChoose(
            bookingData: _formData,
            onBookingDataChange: (data) {
              setState(() {
                _bookingRooms.add(data);
              });
            },
            data: _formData,
          )
        : BookingServiceChoice(
            cusId: _formData['cusId'],
            bookingChoices: _bookingServices,
            onRemove: (index) {
              setState(() {
                _bookingServices.removeAt(index);
              });
            },
            onUpdate: () {
              // Update total price and other calculations
            },
          );
  }

  Widget _buildPaymentStep() {
    return Column(
      children: [
        TextField(
          decoration: InputDecoration(labelText: 'Name'),
          controller: TextEditingController(text: _formData['name']),
          enabled: false,
        ),
        TextField(
          decoration: InputDecoration(labelText: 'Phone'),
          controller: TextEditingController(text: _formData['phone']),
          enabled: false,
        ),
        TextField(
          decoration: InputDecoration(labelText: 'Address'),
          controller: TextEditingController(text: _formData['address']),
          enabled: false,
        ),
        TextField(
          decoration: InputDecoration(labelText: 'Note'),
          onChanged: (value) {
            setState(() {
              _formData['note'] = value;
            });
          },
        ),
        // Add payment method selection here
      ],
    );
  }

  Widget _buildConfirmStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Booking Summary', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        SizedBox(height: 16),
        Text('Customer Information:'),
        Text('Name: ${_formData['name']}'),
        Text('Phone: ${_formData['phone']}'),
        Text('Address: ${_formData['address']}'),
        Text('Note: ${_formData['note']}'),
        SizedBox(height: 16),
        Text('Booking Details:'),
        if (_selectedOption == 'Room')
          ..._bookingRooms.map((room) => Text('Room: ${room['room']} - Pet: ${room['pet']}')),
        if (_selectedOption == 'Service')
          ..._bookingServices.map((service) => Text('Service: ${service['service']} - Pet: ${service['pet']}')),
        SizedBox(height: 16),
        Text('Price Information:'),
        Text('Total Price: $_totalPrice VND'),
        if (_finalDiscount > 0)
          Text('Discount: -$_finalDiscount VND'),
        Text('Final Price: $_discountedPrice VND'),
      ],
    );
  }
} 