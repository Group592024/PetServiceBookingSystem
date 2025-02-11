import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ChangePasswordPage extends StatefulWidget {
  @override
  _ChangePasswordPageState createState() =>
      _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  TextEditingController currentPasswordController = TextEditingController();
  TextEditingController newPasswordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();
  bool showCurrentPassword = false;
  bool showNewPassword = false;
  bool showConfirmPassword = false;
  String accountName = 'Admin';
  String? imagePreview;

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, String> errors = {};

  @override
  void initState() {
    super.initState();
    // Fetch account name and image on initialization
    _fetchAccountData();
  }

  _fetchAccountData() async {
    // Assuming that we retrieve account data based on an accountId
    try {
      final response = await http.get(
          Uri.parse('http://localhost:5000/api/Account?AccountId=d16f43b2-17cf-4a1e-8d9a-16fa813a13fb'));

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        setState(() {
          accountName = data['accountName'] ?? 'Admin';
          imagePreview = data['accountImage']; // assuming this is a URL or base64 string
        });
      } else {
        throw Exception('Failed to load account data');
      }
    } catch (e) {
      // Handle error, show a SnackBar or something
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("Error fetching account data: $e"),
        backgroundColor: Colors.red,
      ));
    }
  }

  Future<void> _changePassword() async {
    setState(() {
      errors.clear();
    });

    // Validate fields
    if (currentPasswordController.text.isEmpty ||
        newPasswordController.text.isEmpty ||
        confirmPasswordController.text.isEmpty) {
      setState(() {
        errors['general'] = 'All fields are required.';
      });
      return;
    }

    if (newPasswordController.text.length < 6) {
      setState(() {
        errors['newPassword'] = 'New password must be at least 6 characters.';
      });
      return;
    }

    if (newPasswordController.text != confirmPasswordController.text) {
      setState(() {
        errors['confirmPassword'] = 'Passwords do not match.';
      });
      return;
    }

    final requestData = {
      'currentPassword': currentPasswordController.text,
      'newPassword': newPasswordController.text,
      'confirmPassword': confirmPasswordController.text
    };

    try {
      final response = await http.put(
        Uri.parse('http://localhost:5000/api/Account/ChangePassword'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestData),
      );

      if (response.statusCode == 200) {
        setState(() {
          currentPasswordController.clear();
          newPasswordController.clear();
          confirmPasswordController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text("Password changed successfully!"),
          backgroundColor: Colors.green,
        ));
      } else {
        final errorData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(errorData['message'] ?? 'Failed to change password'),
          backgroundColor: Colors.red,
        ));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('An error occurred. Please try again later.'),
        backgroundColor: Colors.red,
      ));
    }
  }

  void _togglePasswordVisibility(bool field) {
    setState(() {
      if (field == true) {
        showCurrentPassword = !showCurrentPassword;
      } else if (field == false) {
        showNewPassword = !showNewPassword;
      } else {
        showConfirmPassword = !showConfirmPassword;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text("Change Password"),
        backgroundColor: Colors.teal,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Section
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 75,
                    backgroundColor: Colors.grey[200],
                    child: imagePreview != null
                        ? ClipOval(
                            child: Image.network(
                              imagePreview!,
                              width: 150,
                              height: 150,
                              fit: BoxFit.cover,
                            ),
                          )
                        : Icon(Icons.account_circle, size: 150),
                  ),
                  SizedBox(height: 16),
                  Text(accountName, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            SizedBox(height: 20),
            // Password Form
            TextField(
              controller: currentPasswordController,
              obscureText: !showCurrentPassword,
              decoration: InputDecoration(
                labelText: "Current Password",
                suffixIcon: IconButton(
                  icon: Icon(showCurrentPassword
                      ? Icons.visibility
                      : Icons.visibility_off),
                  onPressed: () => _togglePasswordVisibility(true),
                ),
              ),
            ),
            if (errors['general'] != null) ...[
              SizedBox(height: 8),
              Text(errors['general']!, style: TextStyle(color: Colors.red)),
            ],
            SizedBox(height: 12),
            TextField(
              controller: newPasswordController,
              obscureText: !showNewPassword,
              decoration: InputDecoration(
                labelText: "New Password",
                suffixIcon: IconButton(
                  icon: Icon(showNewPassword
                      ? Icons.visibility
                      : Icons.visibility_off),
                  onPressed: () => _togglePasswordVisibility(false),
                ),
              ),
            ),
            if (errors['newPassword'] != null) ...[
              SizedBox(height: 8),
              Text(errors['newPassword']!, style: TextStyle(color: Colors.red)),
            ],
            SizedBox(height: 12),
            TextField(
              controller: confirmPasswordController,
              obscureText: !showConfirmPassword,
              decoration: InputDecoration(
                labelText: "Confirm Password",
                suffixIcon: IconButton(
                  icon: Icon(showConfirmPassword
                      ? Icons.visibility
                      : Icons.visibility_off),
                  onPressed: () => _togglePasswordVisibility(false),
                ),
              ),
            ),
            if (errors['confirmPassword'] != null) ...[
              SizedBox(height: 8),
              Text(errors['confirmPassword']!, style: TextStyle(color: Colors.red)),
            ],
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  onPressed: _changePassword,
                  child: Text("Change Password"),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Go back to the previous page
                  },
                  child: Text("Back"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
