import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
class ChangePasswordPage extends StatefulWidget {
  final String accountId;
  const ChangePasswordPage({super.key, required this.accountId, required String title});
  @override
  _ChangePasswordPageState createState() => _ChangePasswordPageState();
}
class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _formKey = GlobalKey<FormState>();
  bool _showCurrentPassword = false;
  bool _showNewPassword = false;
  bool _showConfirmPassword = false;
  String accountId = '';
  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  Future<void>? _fetchDataFuture;
  String? imagePreview;
  String? accountName;
  @override
  void initState() {
    super.initState();
    fetchAccountData();
    _loadAccountId();
  }
  Future<void> _loadAccountId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      accountId = prefs.getString('accountId') ?? '';
    });
    print("Loaded Account ID: $accountId");
    if (accountId.isNotEmpty) {
      setState(() {
        _fetchDataFuture =
            fetchAccountData(); 
      });
    }
  }
  Future<void> fetchAccountData() async {
    try {
      final response = await http.get(
        Uri.parse('http://192.168.1.17:5000/api/Account?AccountId=$accountId'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          accountName = data['accountName'] ?? 'N/A';
          if (data['accountImage'] != null) {
            fetchImage(data['accountImage']);
          }
        });
      }
    } catch (error) {
      print("Lỗi khi gọi API: $error");
    }
  }
  Future<void> fetchImage(String filename) async {
    try {
      final imageResponse = await http.get(
        Uri.parse(
            'http://192.168.1.17:5000/api/Account/loadImage?filename=$filename'),
      );
      if (imageResponse.statusCode == 200) {
        final imageData = jsonDecode(imageResponse.body);
        if (imageData['flag']) {
          setState(() {
            imagePreview =
                "data:image/png;base64,${imageData['data']['fileContents']}";
          });
        }
      }
    } catch (error) {
      print("Lỗi khi lấy ảnh: $error");
    }
  }
  Future<void> _changePassword() async {
  if (!_formKey.currentState!.validate()) {
    return;
  }
  final String apiUrl =
      'http://192.168.1.17:5000/api/Account/ChangePassword$accountId';
  final response = await http.put(
    Uri.parse(apiUrl),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'currentPassword': _currentPasswordController.text,
      'newPassword': _newPasswordController.text,
      'confirmPassword': _confirmPasswordController.text,
    }),
  );
  if (response.statusCode == 200) {
    _showAlert('Success', 'Password changed successfully!', () {
      //Navigator.popUntil(context, ModalRoute.withName('/home')); 
      // Hoặc nếu chưa có route tên '/profile', bạn có thể dùng:
       Navigator.pushReplacementNamed(context, '/home');
    });
  } else {
    final errorData = jsonDecode(response.body);
    _showAlert('Error', errorData['message'] ?? 'Failed to change password', null);
  }
}

void _showAlert(String title, String message, VoidCallback? onConfirm) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
            if (onConfirm != null) {
              onConfirm();
            }
          },
          child: Text('OK'),
        ),
      ],
    ),
  );
}

 
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.black),
        automaticallyImplyLeading: false,
      ),
      body: _fetchDataFuture == null
          ? Center(
              child:
                  CircularProgressIndicator()) 
          : FutureBuilder<void>(
              future:
                  _fetchDataFuture, 
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(child: Text('Lỗi khi tải dữ liệu'));
                }
                return SingleChildScrollView(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Container(
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(color: Colors.black12, blurRadius: 5)
                          ],
                        ),
                        child: Column(
                          children: [
                            CircleAvatar(
                              radius: 60,
                              backgroundImage: imagePreview != null
                                  ? NetworkImage(imagePreview!)
                                  : null,
                              child: imagePreview == null
                                  ? Icon(Icons.person,
                                      size: 60, color: Colors.grey)
                                  : null,
                            ),
                            SizedBox(height: 10),
                            Text(
                              accountName ?? 'Loading...',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 16),
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.grey, width: 1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: buildPasswordField(
                                  'Current Password',
                                  _currentPasswordController,
                                  _showCurrentPassword, () {
                                setState(() => _showCurrentPassword =
                                    !_showCurrentPassword);
                              }),
                            ),
                            SizedBox(height: 16),
                            Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.grey, width: 1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: buildPasswordField('New Password',
                                  _newPasswordController, _showNewPassword, () {
                                setState(
                                    () => _showNewPassword = !_showNewPassword);
                              }),
                            ),
                            SizedBox(height: 16),
                            Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.grey, width: 1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: buildPasswordField(
                                  'Confirm Password',
                                  _confirmPasswordController,
                                  _showConfirmPassword, () {
                                setState(() => _showConfirmPassword =
                                    !_showConfirmPassword);
                              }),
                            ),
                            SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                ElevatedButton(
                                  onPressed: _changePassword,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.teal,
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                  ),
                                  child: Text("Change Password",
                                      style: TextStyle(
                                          color: Colors.white, fontSize: 16)),
                                ),
                                OutlinedButton(
                                  onPressed: () => Navigator.pop(context),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.grey,
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                  ),
                                  child: Text("Back",
                                      style: TextStyle(
                                          color: Colors.white, fontSize: 16)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
Widget buildPasswordField(String label, TextEditingController controller,
    bool obscureText, VoidCallback toggleVisibility) {
  return TextFormField(
    controller: controller,
    obscureText: !obscureText,
    decoration: InputDecoration(
      labelText: label,
      suffixIcon: IconButton(
        icon: Icon(obscureText ? Icons.visibility : Icons.visibility_off),
        onPressed: toggleVisibility,
      ),
      enabledBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent), 
      ),
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent),
      ),
    ),
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Please enter $label';
      }
      return null;
    },
  );
}
