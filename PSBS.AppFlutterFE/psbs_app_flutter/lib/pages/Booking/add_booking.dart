import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'booking_room_form.dart'; 
import 'booking_service_form.dart'; 
import 'package:http/http.dart' as http;
import 'dart:convert';

class AddBookingPage extends StatefulWidget {
  @override
  _AddBookingPageState createState() => _AddBookingPageState();
}

class _AddBookingPageState extends State<AddBookingPage> {
  int _currentStep = 0;
  String? _cusId;
  List<Map<String, dynamic>> _paymentTypes = [];
  String? _selectedPaymentType;
  String _serviceType = '';
  List<Map<String, dynamic>> _bookingRoomData = []; 
    List<Map<String, dynamic>> _vouchers = [];
  String? _selectedVoucher;

  @override
  void initState() {
    super.initState();
    _loadCustomerId();
    _fetchPaymentTypes();
     _fetchVouchers();
  }

  Future<void> _loadCustomerId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _cusId = prefs.getString('accountId'); 
    });
  }

  Future<void> _fetchPaymentTypes() async {
    try {
      final response = await http.get(Uri.parse('http://127.0.0.1:5115/api/PaymentType'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _paymentTypes = List<Map<String, dynamic>>.from(data['data']);
        });
      } else {
        print("Failed to load payment types");
      }
    } catch (e) {
      print("Error fetching payment types: $e");
    }
  }

    Future<void> _fetchVouchers() async {
    try {
      final response = await http.get(Uri.parse('http://127.0.0.1:5022/api/Voucher/valid-voucher'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _vouchers = List<Map<String, dynamic>>.from(data['data']);
        });
      } else {
        print("Failed to load vouchers");
      }
    } catch (e) {
      print("Error fetching vouchers: $e");
    }
  }

  void _updateBookingRoomData(List<Map<String, dynamic>> data) {
    setState(() {
      _bookingRoomData = data;
    });
  }

  List<Step> _getSteps() {
    return [
      Step(
        title: Text("Choose Booking Type"),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text("Select the booking type you want to book.", style: TextStyle(color: Colors.grey[600])),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildServiceOption("Room"),
                SizedBox(width: 16),
                _buildServiceOption("Service"),
              ],
            ),
          ],
        ),
        isActive: _currentStep >= 0,
      ),
      Step(
        title: Text("Booking Details"),
        content: _serviceType == "Room"
            ? BookingRoomForm(
                cusId: _cusId,
                onBookingDataChange: _updateBookingRoomData,
              )
            : _serviceType == "Service"
                ? BookingServiceForm(cusId: _cusId)
                : Text("Please select a booking type."),
        isActive: _currentStep >= 1,
      ),Step(
        title: Text("Choose Voucher"),
        content: _vouchers.isEmpty
            ? CircularProgressIndicator()
            : Column(
                children: _vouchers.map((voucher) {
                  return RadioListTile(
                    title: Text(voucher['voucherName']),
                    subtitle: Text("Discount: ${voucher['voucherDiscount']}% - Max: ${voucher['voucherMaximum']} VND"),
                    value: voucher['voucherId'],
                    groupValue: _selectedVoucher,
                    onChanged: (value) {
                      setState(() {
                        _selectedVoucher = value.toString();
                      });
                    },
                  );
                }).toList(),
              ),
        isActive: _currentStep >= 2,
      ),
      Step(
        title: Text("Choose Payment Type"),
        content: _paymentTypes.isEmpty
            ? CircularProgressIndicator()
            : Column(
                children: _paymentTypes.map((type) {
                  return RadioListTile(
                    title: Text(type['paymentTypeName']),
                    value: type['paymentTypeId'],
                    groupValue: _selectedPaymentType,
                    onChanged: (value) {
                      setState(() {
                        _selectedPaymentType = value.toString();
                      });
                    },
                  );
                }).toList(),
              ),
        isActive: _currentStep >= 2,
      ),
    ];
  }

  Widget _buildServiceOption(String option) {
    return GestureDetector(
      onTap: () {
        setState(() => _serviceType = option);
      },
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 24),
        decoration: BoxDecoration(
          color: _serviceType == option ? Colors.green : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: _serviceType == option ? Colors.green : Colors.grey,
            width: 2,
          ),
        ),
        child: Text(
          option,
          style: TextStyle(
            color: _serviceType == option ? Colors.white : Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  void _onStepContinue() {
    if (_currentStep < _getSteps().length - 1) {
      setState(() => _currentStep += 1);
    } else {
      print("Booking Complete:");
      print("Service Type: $_serviceType");
      print("Selected Voucher: $_selectedVoucher");
      print("Selected Payment Type: $_selectedPaymentType");
      print("Booking Room Data: ${jsonEncode(_bookingRoomData)}");

      Navigator.pop(context);
    }
  }

  void _onStepCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep -= 1);
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Add Booking")),
      body: Stepper(
        steps: _getSteps(),
        currentStep: _currentStep,
        onStepContinue: _onStepContinue,
        onStepCancel: _onStepCancel,
      ),
    );
  }
}
