import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
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
            _showToast('Your account has been deleted. Please contact support.');
          } else {
            String role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
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
    final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    return jsonDecode(payload);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text('LOGO', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
              SizedBox(height: 32),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/forgotpassword'),
                  child: Text('Forgot Password?',
                      style: TextStyle(color: Colors.blue, fontSize: 14)),
                ),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _handleLogin,
                child: Text('LOGIN'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 48),
                ),
              ),
              SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: Text('Don’t have an account? Register Now !!'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
