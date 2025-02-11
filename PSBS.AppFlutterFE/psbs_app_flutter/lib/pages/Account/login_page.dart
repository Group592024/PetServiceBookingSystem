import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  void _showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  bool _validateForm() {
    String email = _emailController.text;
    String password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _showToast('Email and password cannot be empty');
      return false;
    }

    String emailRegex = r'^[^\s@]+@[^\s@]+\.[^\s@]+\$';
    if (!RegExp(emailRegex).hasMatch(email)) {
      _showToast('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      _showToast('Password must be at least 6 characters');
      return false;
    }

    return true;
  }

  Future<void> _handleLogin() async {
    if (!_validateForm()) return;

    String email = _emailController.text;
    String password = _passwordController.text;

    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/api/Account/Login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'AccountEmail': email, 'AccountPassword': password}),
      );

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        if (result['flag'] == true) {
          SharedPreferences prefs = await SharedPreferences.getInstance();
          prefs.setString('token', result['data']);

          Map<String, dynamic> decodedToken = _parseJwt(result['data']);

          if (decodedToken['AccountIsDeleted'] == 'True') {
            _showToast(
                'Your account has been deleted. Please contact support.');
          } else {
            String role = decodedToken[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            prefs.setString('role', role);

            if (role == 'user') {
              Navigator.pushReplacementNamed(context, '/');
            } else {
              Navigator.pushReplacementNamed(context, '/account');
            }
          }
        } else {
          _showToast(result['message'] ?? 'Login failed. Please try again.');
        }
      } else {
        _showToast('Error: ${response.statusCode}');
      }
    } catch (e) {
      _showToast('An error occurred. Please try again.');
      print('Error: $e');
    }
  }

  Map<String, dynamic> _parseJwt(String token) {
    final parts = token.split('.');
    final payload =
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    return jsonDecode(payload);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Set the background color to white
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Logo Section with gray background
              Container(
                padding: EdgeInsets.symmetric(vertical: 32.0, horizontal: 48.0),
                color: Colors.grey[300], // Set gray background color
                child: Text(
                  'Logo',
                  style: TextStyle(
                    fontSize: 48, // Adjust font size
                    fontWeight: FontWeight.bold, // Make it bold
                    color: Colors.black, // Set the text color to white
                  ),
                ),
              ),
              SizedBox(height: 32),
              // Login Title
              Text('Login',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
              SizedBox(height: 32),
              // Email Input Field
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              // Password Input Field
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              SizedBox(height: 16),
              // Forgot Password
              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/forgotpassword'),
                  child: Text('Forgot Password?',
                      style: TextStyle(color: Colors.cyan, fontSize: 14)),
                ),
              ),
              SizedBox(height: 16),
              // Login Button
              ElevatedButton(
                onPressed: _handleLogin,
                child: Text('LOGIN'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 48),
                  backgroundColor:
                      Colors.grey[500], // Set the button color to gray
                  foregroundColor: Colors.white, // Set the text color to white
                ),
              ),
              SizedBox(height: 16),
              // Register Now Section
              RichText(
                text: TextSpan(
                  style: TextStyle(
                      color: Colors.black,
                      fontSize: 14), // Default style (black text)
                  children: [
                    TextSpan(
                        text: "Don’t have an account? "), // First part (black)
                    TextSpan(
                      text: "Register Now", // Second part (blue)
                      style: TextStyle(color: Colors.cyan),
                      recognizer: TapGestureRecognizer()
                        ..onTap = () => Navigator.pushNamed(
                            context, '/register'), // Handle navigation
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
