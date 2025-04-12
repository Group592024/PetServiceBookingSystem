import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'booking_room_form.dart';
import 'booking_service_form.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';

class AddBookingPage extends StatefulWidget {
  @override
  _AddBookingPageState createState() => _AddBookingPageState();
}

class _AddBookingPageState extends State<AddBookingPage> {
  // Network configuration
  static const String apiBaseUrl = 'http://127.0.0.1:5050';
  static const String bookingBaseUrl = 'http://127.0.0.1:5115';
  static const String paymentBaseUrl = 'https://10.211.55.7:5201';

  // Rest of your existing variables
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
  bool _isProcessing = false;
  String _voucherSearchCode = '';
  bool _searchLoading = false;
  String _searchError = '';

  @override
  void initState() {
    super.initState();
    _loadCustomerId();
    _fetchPaymentTypes();
    _fetchVouchers();
  }

  Future<void> _loadCustomerId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _cusId = prefs.getString('accountId');
      });
    }
  }

  Future<void> _fetchPaymentTypes() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/PaymentType'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        setState(() {
          _paymentTypes = List<Map<String, dynamic>>.from(data['data']);
        });
      }
    } catch (e) {
      print("Error fetching payment types: $e");
    }
  }

  Future<void> _fetchVouchers() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/Voucher/valid-voucher'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        setState(() {
          _vouchers = List<Map<String, dynamic>>.from(data['data']);
        });
      }
    } catch (e) {
      print("Error fetching vouchers: $e");
    }
  }

  void _updateBookingRoomData(List<Map<String, dynamic>> data) {
    if (!mounted) return;
    setState(() {
      _bookingRoomData = data;
      _calculateTotalPrice();
    });
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
    print('=== AddBookingPage: _updateBookingServiceData ===');
    print('Received Data:');
    print(json.encode(data));

    if (mounted) {
      setState(() {
        _bookingServiceData = List<Map<String, dynamic>>.from(data);
        print(
            'Updated _bookingServiceData length: ${_bookingServiceData.length}');
        print(
            'Updated Service Variant: ${_bookingServiceData.first['serviceVariant']['content']} - ${_bookingServiceData.first['serviceVariant']['price']}');
        _calculateTotalPrice();
      });
    }
  }

  void _calculateTotalPrice() {
    double total = 0.0;
    double subtotal = 0.0;

    if (_serviceType == "Room") {
      subtotal = _bookingRoomData.fold(0.0, (sum, room) {
        double price = double.tryParse(room["price"].toString()) ?? 0.0;
        return sum + price;
      });
    } else if (_serviceType == "Service") {
      subtotal = _bookingServiceData.fold(0.0, (sum, service) {
        if (service["serviceVariant"] != null) {
          double price =
              double.tryParse(service["serviceVariant"]["price"].toString()) ??
                  0.0;
          return sum + price;
        }
        return sum;
      });
    }

    // Apply voucher discount if selected
    if (_selectedVoucher != null) {
      var voucher = _vouchers.firstWhere(
          (v) => v['voucherId'] == _selectedVoucher,
          orElse: () => {});

      if (voucher.isNotEmpty) {
        double discount =
            double.tryParse(voucher['voucherDiscount'].toString()) ?? 0.0;
        double maxDiscount =
            double.tryParse(voucher['voucherMaximum'].toString()) ?? 0.0;

        // Calculate discount amount
        double discountAmount =
            (subtotal * discount / 100).clamp(0, maxDiscount);
        total = subtotal - discountAmount;

        print('=== Price Calculation with Voucher ===');
        print('Subtotal: $subtotal');
        print('Discount Percentage: $discount%');
        print('Maximum Discount: $maxDiscount');
        print('Applied Discount: $discountAmount');
        print('Final Total: $total');
      } else {
        total = subtotal;
      }
    } else {
      total = subtotal;
    }

    if (mounted) {
      setState(() {
        _totalPrice = total;
      });
    }
  }

  Future<void> _fetchRoomName(String roomId) async {
    if (_roomNames.containsKey(roomId)) return;

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/Room/$roomId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        setState(() {
          _roomNames[roomId] = data['data']['roomName'] ?? 'Unknown Room';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _roomNames[roomId] = 'Unknown Room';
        });
      }
    }
  }

  Future<void> _fetchPetName(String petId) async {
    if (_petNames.containsKey(petId)) return;

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/pet/$petId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200 && mounted) {
        final data = json.decode(response.body);
        setState(() {
          _petNames[petId] = data['data']['petName'] ?? 'Unknown Pet';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _petNames[petId] = 'Unknown Pet';
        });
      }
    }
  }

  Future<void> _searchVoucher() async {
    if (_voucherSearchCode.trim().isEmpty) {
      setState(() {
        _searchError = "Please enter a voucher code";
      });
      return;
    }

    setState(() {
      _searchLoading = true;
      _searchError = '';
    });

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse(
            '$apiBaseUrl/api/Voucher/search-gift-code?voucherCode=$_voucherSearchCode'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag'] && data['data'] != null) {
          // Check if this voucher is already in our list
          bool exists =
              _vouchers.any((v) => v['voucherId'] == data['data']['voucherId']);

          if (!exists) {
            setState(() {
              _vouchers = [..._vouchers, data['data']];
            });
          }

          setState(() {
            _selectedVoucher = data['data']['voucherId'];
            _calculateTotalPrice();
          });
        } else {
          setState(() {
            _searchError = data['message'] ?? "Voucher not found";
          });
        }
      }
    } catch (e) {
      setState(() {
        _searchError = "Error searching voucher";
      });
      print("Error searching voucher: $e");
    } finally {
      setState(() {
        _searchLoading = false;
      });
    }
  }

  Future<bool> _launchUrl(String url) async {
    try {
      print('[DEBUG] Attempting to launch URL: $url');

      if (await canLaunchUrl(Uri.parse(url))) {
        final result = await launchUrl(
          Uri.parse(url),
          mode: LaunchMode.externalApplication,
        );
        print('[DEBUG] launchUrl result: $result');
        return result;
      }
      print('[ERROR] URL cannot be handled: $url');
      return false;
    } catch (e, stackTrace) {
      print('[ERROR] Exception in _launchUrl: $e\n$stackTrace');
      return false;
    }
  }

  Future<String?> _getPaymentTypeName(String paymentTypeId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/PaymentType/$paymentTypeId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag']) {
          return data['data']['paymentTypeName'];
        }
      }
      return null;
    } catch (e) {
      print("Error fetching payment type: $e");
      return null;
    }
  }

  Future<void> _sendRoomBookingRequest() async {
    if (mounted) setState(() => _isProcessing = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? accountId = prefs.getString('accountId');

      String? paymentTypeName =
          await _getPaymentTypeName(_selectedPaymentType ?? '');

      final customerResponse = await http.get(
        Uri.parse('$apiBaseUrl/api/Account/$accountId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (customerResponse.statusCode != 200) {
        throw Exception('Failed to fetch customer information');
      }

      final customerData = json.decode(customerResponse.body)['data'];

      Map<String, dynamic> requestData = {
        'bookingRooms': _bookingRoomData
            .map((room) => {
                  'room': room['room'],
                  'pet': room['pet'],
                  'start': room['start'],
                  'end': room['end'],
                  'price': room['price'],
                  'camera': room['camera'],
                  'petName': _petNames[room['pet'].toString()] ?? 'Unknown Pet'
                })
            .toList(),
        'customer': {
          'cusId': accountId,
          'name': customerData['accountName'],
          'address': customerData['accountAddress'],
          'phone': customerData['accountPhoneNumber'],
          'note': '',
          'paymentMethod': _selectedPaymentType
        },
        'selectedOption': 'Room',
        'voucherId': _selectedVoucher ?? '00000000-0000-0000-0000-000000000000',
        'totalPrice': _totalPrice,
        'discountedPrice': _totalPrice
      };

      final response = await http.post(
        Uri.parse('$bookingBaseUrl/Bookings/room'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestData),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);

        if (paymentTypeName == "VNPay") {
          final bookingCode = result['data'].toString().trim();
          final amount = _totalPrice.toInt();

          final vnpayUrl = '$paymentBaseUrl/Bookings/CreatePaymentUrl?'
              'moneyToPay=$amount&'
              'description=$bookingCode&'
              'returnUrl=$paymentBaseUrl/Vnpay/Callback';

          if (!await _launchUrl(vnpayUrl)) {
            if (mounted) {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => Scaffold(
                    appBar: AppBar(title: const Text('Payment')),
                    body: WebViewWidget(
                      // Changed from WebView to WebViewWidget
                      controller: WebViewController()
                        ..loadRequest(Uri.parse(vnpayUrl))
                        ..setJavaScriptMode(JavaScriptMode.unrestricted),
                    ),
                  ),
                ),
              );
            }
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Room booking created successfully')),
            );
            Navigator.pop(context);
          }
        }
      } else {
        throw Exception('Failed to create room booking: ${response.body}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating room booking: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _sendServiceBookingRequest() async {
    if (mounted) setState(() => _isProcessing = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? accountId = prefs.getString('accountId');

      String? paymentTypeName =
          await _getPaymentTypeName(_selectedPaymentType ?? '');

      final customerResponse = await http.get(
        Uri.parse('$apiBaseUrl/api/Account/$accountId'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (customerResponse.statusCode != 200) {
        throw Exception('Failed to fetch customer information');
      }

      final customerData = json.decode(customerResponse.body)['data'];

      List<Map<String, dynamic>> services = _bookingServiceData.map((service) {
        return {
          "service": service["service"]["id"].toString(),
          "pet": service["pet"]["id"].toString(),
          "price": service["price"] ?? 0.0,
          "serviceVariant": service["serviceVariant"]["id"].toString(),
        };
      }).toList();

      Map<String, dynamic> requestData = {
        "services": services,
        "customer": {
          "cusId": accountId,
          "name": customerData['accountName'],
          "address": customerData['accountAddress'],
          "phone": customerData['accountPhoneNumber'],
          "note": '',
          "paymentMethod": _selectedPaymentType
        },
        "selectedOption": "Service",
        "voucherId": _selectedVoucher ?? "00000000-0000-0000-0000-000000000000",
        "totalPrice": _totalPrice,
        "discountedPrice": _totalPrice,
        "bookingServicesDate": _bookingServiceData.isNotEmpty
            ? _bookingServiceData[0]["bookingDate"].toString().substring(0, 16)
            : DateTime.now().toIso8601String().substring(0, 16)
      };

      final response = await http.post(
        Uri.parse('$bookingBaseUrl/Bookings/service'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: jsonEncode(requestData),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);

        if (paymentTypeName == "VNPay") {
          final bookingCode = result['data'].toString().trim();
          final amount = _totalPrice.toInt();

          final vnpayUrl = '$paymentBaseUrl/Bookings/CreatePaymentUrl?'
              'moneyToPay=$amount&'
              'description=$bookingCode&'
              'returnUrl=$paymentBaseUrl/Vnpay/Callback';

          if (!await _launchUrl(vnpayUrl)) {
            if (mounted) {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => Scaffold(
                    appBar: AppBar(title: const Text('Payment')),
                    body: WebViewWidget(
                      controller: WebViewController()
                        ..loadRequest(Uri.parse(vnpayUrl))
                        ..setJavaScriptMode(JavaScriptMode.unrestricted),
                    ),
                  ),
                ),
              );
            }
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Service booking created successfully')),
            );
            Navigator.pop(context);
          }
        }
      } else {
        throw Exception('Failed to create service booking: ${response.body}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating service booking: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  StepState _getStepState(int step) {
    if (_currentStep > step) {
      return StepState.complete;
    } else if (_currentStep == step) {
      return StepState.editing;
    }
    return StepState.indexed;
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
        content: Column(
          children: [
            // Voucher Search Section
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: 'Search Voucher by Code',
                      border: OutlineInputBorder(),
                    ),
                    controller: TextEditingController(text: _voucherSearchCode),
                    onChanged: (value) {
                      setState(() {
                        _voucherSearchCode = value;
                      });
                    },
                    enabled: !_searchLoading,
                  ),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _searchLoading || _voucherSearchCode.trim().isEmpty
                      ? null
                      : _searchVoucher,
                  child: _searchLoading
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text("Apply Voucher"),
                ),
              ],
            ),
            if (_searchError.isNotEmpty)
              Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text(
                  _searchError,
                  style: TextStyle(color: Colors.red),
                ),
              ),
            SizedBox(height: 16),
            _vouchers.isEmpty
                ? Text("No vouchers available")
                : DropdownButtonFormField<String>(
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
        state: _getStepState(2),
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
        title: Text(
          "Booking Summary",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.blue.shade800,
          ),
        ),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Service Type Header
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                "Service Type: $_serviceType",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade700,
                ),
              ),
            ),
            SizedBox(height: 16),

            Text(
              "Booking Details:",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            SizedBox(height: 8),

            if (_serviceType == "Room") ...[
              ..._bookingRoomData.map((room) => Card(
                    elevation: 2,
                    margin: EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow(
                            icon: Icons.meeting_room,
                            label: "Room",
                            value: _roomNames[room["room"].toString()] ??
                                "Loading...",
                          ),
                          _buildDetailRow(
                            icon: Icons.pets,
                            label: "Pet",
                            value: _petNames[room["pet"].toString()] ??
                                "Loading...",
                          ),
                          _buildDetailRow(
                            icon: Icons.calendar_today,
                            label: "Start Date",
                            value: _formatDate(room["start"]),
                          ),
                          _buildDetailRow(
                            icon: Icons.calendar_today,
                            label: "End Date",
                            value: _formatDate(room["end"]),
                          ),
                          _buildDetailRow(
                            icon: Icons.attach_money,
                            label: "Room Price",
                            value: "${room["price"]} VND",
                            valueStyle: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.green.shade700,
                            ),
                          ),
                          _buildDetailRow(
                            icon: Icons.videocam,
                            label: "Camera",
                            value: room["camera"] ? "Yes (+50,000 VND)" : "No",
                          ),
                          Divider(height: 20),
                        ],
                      ),
                    ),
                  )),
              _buildPriceRow(
                label: "Subtotal",
                value: "${_calculateSubtotal()} VND",
              ),
              if (_selectedVoucher != null) ...[
                SizedBox(height: 8),
                _buildDetailRow(
                  icon: Icons.local_offer,
                  label: "Voucher Applied",
                  value: _vouchers.firstWhere(
                      (v) => v['voucherId'] == _selectedVoucher,
                      orElse: () => {})['voucherName'],
                  valueStyle: TextStyle(color: Colors.blue.shade700),
                ),
                _buildPriceRow(
                  label: "Discount",
                  value: "${_calculateDiscount()} VND",
                  isDiscount: true,
                ),
              ],
              Divider(thickness: 2, height: 24),
              _buildPriceRow(
                label: "Final Total",
                value: "$_totalPrice VND",
                isTotal: true,
              ),
            ] else ...[
              ..._bookingServiceData.map((service) => Card(
                    elevation: 2,
                    margin: EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            service["service"]?["name"] ?? "Unknown Service",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.purple.shade700,
                            ),
                          ),
                          SizedBox(height: 8),
                          _buildDetailRow(
                            icon: Icons.category,
                            label: "Variant",
                            value: service["serviceVariant"]?["content"] ??
                                "No Variant",
                          ),
                          _buildDetailRow(
                            icon: Icons.attach_money,
                            label: "Price",
                            value:
                                "${service["serviceVariant"]?["price"] ?? "0"} VND",
                            valueStyle: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.green.shade700,
                            ),
                          ),
                          _buildDetailRow(
                            icon: Icons.pets,
                            label: "Pet",
                            value: service["pet"]?["name"] ?? "Unknown Pet",
                          ),
                          Divider(height: 20),
                        ],
                      ),
                    ),
                  )),
              _buildPriceRow(
                label: "Total Price",
                value: "$_totalPrice VND",
              ),
            ],
            SizedBox(height: 16),
            _buildDetailRow(
              icon: Icons.local_offer,
              label: "Voucher Applied",
              value: _vouchers.firstWhere(
                      (v) => v['voucherId'] == _selectedVoucher,
                      orElse: () => {})['voucherName'] ??
                  "No Voucher",
            ),
            _buildDetailRow(
              icon: Icons.payment,
              label: "Payment Type",
              value: _paymentTypes.firstWhere(
                      (p) => p['paymentTypeId'] == _selectedPaymentType,
                      orElse: () => {})['paymentTypeName'] ??
                  "Not Selected",
            ),
          ],
        ),
        isActive: _currentStep >= 3,
      ),
    ];
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    TextStyle? valueStyle,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade600),
          SizedBox(width: 8),
          Text(
            "$label: ",
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          Expanded(
            child: Text(
              value,
              style: valueStyle ?? TextStyle(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow({
    required String label,
    required String value,
    bool isDiscount = false,
    bool isTotal = false,
  }) {
    return Container(
      padding: EdgeInsets.all(12),
      margin: EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: isTotal ? Colors.blue.shade50 : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isDiscount ? Colors.red.shade700 : Colors.grey.shade800,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: isTotal ? 16 : 14,
              color: isDiscount
                  ? Colors.red.shade700
                  : isTotal
                      ? Colors.blue.shade800
                      : Colors.green.shade700,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('MMM dd, yyyy - hh:mm a').format(date);
    } catch (e) {
      return dateString;
    }
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
    // Step 0 validation - must choose service type
    if (_currentStep == 0 && _serviceType.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a booking type')),
      );
      return;
    }

    // Step 1 validation - must have valid booking data
    if (_currentStep == 1) {
      if (_serviceType == "Room" &&
          (_bookingRoomData.isEmpty ||
              _bookingRoomData.any((room) =>
                  room["room"] == null ||
                  room["pet"] == null ||
                  room["start"] == null ||
                  room["end"] == null))) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Please complete all booking room information')),
        );
        return;
      } else if (_serviceType == "Service" && _bookingServiceData.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please add at least one service booking')),
        );
        return;
      }
    }

    // Step 3 validation - must select payment type
    if (_currentStep == 3 && _selectedPaymentType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a payment method')),
      );
      return;
    }

    if (_currentStep < _getSteps().length - 1) {
      setState(() => _currentStep += 1);
    } else {
      if (_serviceType == "Room") {
        _sendRoomBookingRequest();
      } else if (_serviceType == "Service") {
        _sendServiceBookingRequest();
      }
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
        onStepContinue: _isProcessing ? null : _onStepContinue,
        onStepCancel: _isProcessing ? null : _onStepCancel,
        controlsBuilder: (BuildContext context, ControlsDetails details) {
          bool isNextDisabled = false;

          // Disable next button based on current step
          if (_currentStep == 0 && _serviceType.isEmpty) {
            isNextDisabled = true;
          } else if (_currentStep == 1) {
            if (_serviceType == "Room" &&
                (_bookingRoomData.isEmpty ||
                    _bookingRoomData.any((room) =>
                        room["room"] == null ||
                        room["pet"] == null ||
                        room["start"] == null ||
                        room["end"] == null))) {
              isNextDisabled = true;
            } else if (_serviceType == "Service" &&
                _bookingServiceData.isEmpty) {
              isNextDisabled = true;
            }
          } else if (_currentStep == 3 && _selectedPaymentType == null) {
            isNextDisabled = true;
          }

          return Padding(
            padding: const EdgeInsets.only(top: 16.0),
            child: Row(
              children: [
                if (_currentStep != 0)
                  TextButton(
                    onPressed: _isProcessing ? null : details.onStepCancel,
                    child: Text('Back'),
                  ),
                SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isProcessing || isNextDisabled
                      ? null
                      : details.onStepContinue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isNextDisabled ? Colors.grey : null,
                  ),
                  child: _isProcessing
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text(_currentStep == _getSteps().length - 1
                          ? 'Submit'
                          : 'Next'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  double _calculateSubtotal() {
    if (_serviceType == "Room") {
      return _bookingRoomData.fold(0.0, (sum, room) {
        double price = double.tryParse(room["price"].toString()) ?? 0.0;
        return sum + price;
      });
    }
    return 0.0;
  }

  double _calculateDiscount() {
    if (_selectedVoucher == null) return 0.0;

    var voucher = _vouchers.firstWhere(
        (v) => v['voucherId'] == _selectedVoucher,
        orElse: () => {});

    if (voucher.isEmpty) return 0.0;

    double subtotal = _calculateSubtotal();
    double discount =
        double.tryParse(voucher['voucherDiscount'].toString()) ?? 0.0;
    double maxDiscount =
        double.tryParse(voucher['voucherMaximum'].toString()) ?? 0.0;

    return (subtotal * discount / 100).clamp(0, maxDiscount);
  }
}
