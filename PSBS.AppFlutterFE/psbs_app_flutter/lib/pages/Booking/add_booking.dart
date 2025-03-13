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
  List<Map<String, dynamic>> _bookingServiceData = [];
  List<Map<String, dynamic>> _vouchers = [];
  String? _selectedVoucher;
  double _totalPrice = 0.0;
  Map<String, String> _roomNames = {};
  Map<String, String> _petNames = {};

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
    print(_cusId);
  }

  Future<void> _fetchPaymentTypes() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/PaymentType'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

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
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      print("Token: $token");
      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Voucher/valid-voucher'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

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
      _calculateTotalPrice();
    });
    // Fetch room and pet names for each booking item
    for (var room in data) {
      if (room.containsKey('room')) {
        _fetchRoomName(room['room'].toString());
      }
      if (room.containsKey('pet')) {
        _fetchPetName(room['pet'].toString());
      }
    }
  }

  void _updateBookingServiceData(List<Map<String, dynamic>> data) {
    setState(() {
      _bookingServiceData = data;
      _calculateTotalPrice();
    });
  }

  void _calculateTotalPrice() {
    double total = 0.0; // Initialize total

    if (_serviceType == "Room") {
      total = _bookingRoomData.fold(0.0, (sum, room) {
        double price = double.tryParse(room["price"].toString()) ?? 0.0;
        return sum + price;
      });
    } else if (_serviceType == "Service") {
      total = _bookingServiceData.fold(0.0, (sum, service) {
        // Check if serviceVariant and price are not null
        if (service["serviceVariant"] != null &&
            service["serviceVariant"]["price"] != null) {
          double price =
              double.tryParse(service["serviceVariant"]["price"].toString()) ??
                  0.0;
          return sum + price;
        } else {
          return sum;
        }
      });
    } else {
      total = 0.0;
    }

    if (_selectedVoucher != null) {
      var voucher = _vouchers.firstWhere(
          (v) => v['voucherId'] == _selectedVoucher,
          orElse: () => {});
      if (voucher.isNotEmpty) {
        double discount =
            double.tryParse(voucher['voucherDiscount'].toString()) ?? 0.0;
        double maxDiscount =
            double.tryParse(voucher['voucherMaximum'].toString()) ?? 0.0;
        double discountAmount = (total * discount / 100).clamp(0, maxDiscount);
        total -= discountAmount;
      }
    }

    setState(() {
      _totalPrice = total;
    });
  }

  Future<void> _fetchRoomName(String roomId) async {
    if (_roomNames.containsKey(roomId)) return; // Prevent duplicate fetch

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Room/$roomId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        String roomName = data['data']['roomName'] ?? 'Unknown Room';

        setState(() {
          _roomNames[roomId] = roomName;
        });
      } else {
        setState(() {
          _roomNames[roomId] = 'Unknown Room';
        });
      }
    } catch (e) {
      print("Error fetching room: $e");
      setState(() {
        _roomNames[roomId] = 'Unknown Room';
      });
    }
  }

  Future<void> _fetchPetName(String petId) async {
    if (_petNames.containsKey(petId)) return; // Prevent duplicate fetch

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/pet/$petId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        String petName = data['data']['petName'] ?? 'Unknown Pet';

        setState(() {
          _petNames[petId] = petName;
        });
      } else {
        setState(() {
          _petNames[petId] = 'Unknown Pet';
        });
      }
    } catch (e) {
      print("Error fetching pet: $e");
      setState(() {
        _petNames[petId] = 'Unknown Pet';
      });
    }
  }

  Future<String> _fetchVoucherName(String voucherId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Voucher/customer/$voucherId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['voucherName'] ?? 'No Voucher';
      } else {
        return 'No Voucher';
      }
    } catch (e) {
      print("Error fetching voucher: $e");
      return 'No Voucher';
    }
  }

  Future<String> _fetchPaymentTypeName(String paymentTypeId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/PaymentType/$paymentTypeId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['paymentTypeName'] ?? 'Unknown Payment Type';
      } else {
        return 'Unknown Payment Type';
      }
    } catch (e) {
      print("Error fetching payment type: $e");
      return 'Unknown Payment Type';
    }
  }

  List<Step> _getSteps() {
    return [
      Step(
        title: Text("Choose Booking Type"),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text("Select the booking type you want to book.",
                style: TextStyle(color: Colors.grey[600])),
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
        content: Column(
          children: [
            _serviceType == "Room"
                ? BookingRoomForm(
                    cusId: _cusId,
                    onBookingDataChange: _updateBookingRoomData,
                  )
                : _serviceType == "Service"
                    ? BookingServiceForm(
                        cusId: _cusId,
                        onBookingServiceDataChange: _updateBookingServiceData)
                    : Text("Please select a booking type."),
            SizedBox(height: 20)
          ],
        ),
        isActive: _currentStep >= 1,
      ),
      Step(
        title: Text("Choose Voucher"),
        content: _vouchers.isEmpty
            ? CircularProgressIndicator()
            : Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedVoucher,
                    hint: Text("Select a Voucher (Optional)"),
                    items: [
                      DropdownMenuItem(
                        value: null,
                        child: Text("No Voucher"),
                      ),
                      ..._vouchers.map((voucher) {
                        return DropdownMenuItem(
                          value: voucher['voucherId'].toString(),
                          child: Text(
                              "${voucher['voucherName']} - ${voucher['voucherDiscount']}% (Max ${voucher['voucherMaximum']} VND)"),
                        );
                      }).toList(),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedVoucher = value;
                        _calculateTotalPrice();
                      });
                    },
                  ),
                ],
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
      Step(
        title: Text("Booking Summary"),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Service Type: $_serviceType"),
            Text("Booking Details:",
                style: TextStyle(fontWeight: FontWeight.bold)),
            if (_serviceType == "Room")
              ..._bookingRoomData.map((room) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                          "Room: ${_roomNames[room["room"].toString()] ?? "Loading..."}"),
                      Text(
                          "Pet: ${_petNames[room["pet"].toString()] ?? "Loading..."}"),
                      Text("Start Date: ${room["start"]}"),
                      Text("End Date: ${room["end"]}"),
                      Text("Price: ${room["price"]} VND"),
                      Text("Camera: ${room["camera"] ? "Yes" : "No"}"),
                      Divider(),
                    ],
                  ))
            else
              ..._bookingServiceData.map((service) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Service Name: ${service["service"]?["name"] ?? "Unknown Service"}',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Variant: ${service["serviceVariant"]?["content"] ?? "No Variant"}',
                        style: TextStyle(fontSize: 14),
                      ),
                      Text(
                        'Variant: ${service["serviceVariant"]?["price"] ?? "No Price"}',
                        style: TextStyle(fontSize: 14),
                      ),
                      Text(
                        'Pet: ${service["pet"]?["name"] ?? "Unknown Pet"}',
                        style: TextStyle(
                            fontSize: 14, fontStyle: FontStyle.italic),
                      ),
                      Divider(),
                    ],
                  )),
            Text("Total Price: $_totalPrice VND",
                style: TextStyle(fontWeight: FontWeight.bold)),
            Text(
                "Voucher Applied: ${_vouchers.firstWhere((v) => v['voucherId'] == _selectedVoucher, orElse: () => {})['voucherName'] ?? "No Voucher"}"),
            Text(
                "Payment Type: ${_paymentTypes.firstWhere((p) => p['paymentTypeId'] == _selectedPaymentType, orElse: () => {})['paymentTypeName'] ?? "Not Selected"}"),
          ],
        ),
        isActive: _currentStep >= 3,
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
      print("Booking Service Data: ${jsonEncode(_bookingServiceData)}");
      Navigator.pop(context);
    }
  }

  Future<void> _sendRoomBookingRequest() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      // Construct the request body
      Map<String, dynamic> requestBody = {
        'SelectedOption': _serviceType,
        'VoucherId': _selectedVoucher,
        'TotalPrice': _totalPrice,
        'DiscountedPrice': _totalPrice,
        'BookingRooms': _bookingRoomData,
        'Customer': '',
      };

      final response = await http.post(
        Uri.parse('http://YOUR_API_ENDPOINT/room'), // Replace with your API URL
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        print('Room booking request successful: ${response.body}');
        // Handle success (e.g., show a success message)
      } else {
        print(
            'Room booking request failed: ${response.statusCode}, ${response.body}');
        // Handle failure (e.g., show an error message)
      }
    } catch (e) {
      print('Error sending room booking request: $e');
      // Handle error (e.g., show an error message)
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
