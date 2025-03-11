import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/main.dart';
import 'package:psbs_app_flutter/services/user_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

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
    String email = _emailController.text.trim();
    String password = _passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      _showToast('Email and password cannot be empty');
      return false;
    }
    String emailRegex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$';
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
    String email = _emailController.text.trim();
    String password = _passwordController.text.trim();
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5050/api/Account/Login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'AccountEmail': email, 'AccountPassword': password}),
      );
      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        if (result['flag'] == true) {
          SharedPreferences prefs = await SharedPreferences.getInstance();
          prefs.setString('token', result['data']);
          Map<String, dynamic> decodedToken = _parseJwt(result['data']);
          String accountId = decodedToken['AccountId'].toString();
          prefs.setString('accountId', accountId);
          useUserStore().loadUserDetails(accountId);
          print("Debug message: Current user is ${useUserStore().currentUser}");
          if (decodedToken['AccountIsDeleted'].toString().toLowerCase() ==
              'true') {
            _showToast(
                'Your account has been deleted. Please contact support.');
          } else {
            String role = decodedToken[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            prefs.setString('role', role);
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                  builder: (context) =>
                      MyHomePage(title: 'PetEase Home', accountId: accountId)),
            );
          }
        } else {
          _showToast(result['message'] ?? 'Login failed. Please try again.');
        }
      } else {
        _showToast('Error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      _showToast('An error occurred. Please try again.');
    }
  }

  Map<String, dynamic> _parseJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) {
        throw Exception('Invalid token format');
      }
      final payload =
          utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      print('Decoded JWT: $payload');
      return jsonDecode(payload);
    } catch (e) {
      print('Error decoding token: $e');
      _showToast('Invalid token received');
      return {};
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.symmetric(vertical: 32.0, horizontal: 48.0),
                color: Colors.grey[300],
                child: Text(
                  'Logo',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
              SizedBox(height: 32),
              Text('Login',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
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
                      style: TextStyle(color: Colors.cyan, fontSize: 14)),
                ),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _handleLogin,
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 48),
                  backgroundColor: Colors.grey[500],
                  foregroundColor: Colors.white,
                ),
                child: Text('LOGIN'),
              ),
              SizedBox(height: 16),
              RichText(
                text: TextSpan(
                  style: TextStyle(color: Colors.black, fontSize: 14),
                  children: [
                    TextSpan(text: "Don’t have an account? "),
                    TextSpan(
                      text: "Register Now",
                      style: TextStyle(color: Colors.cyan),
                      recognizer: TapGestureRecognizer()
                        ..onTap =
                            () => Navigator.pushNamed(context, '/register'),
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
