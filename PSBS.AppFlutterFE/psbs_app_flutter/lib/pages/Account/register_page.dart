import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  String name = '';
  String email = '';
  String phoneNumber = '';
  String password = '';
  String gender = '';
  DateTime? dob;
  String address = '';

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      try {
        final response = await http.post(
          Uri.parse('http://localhost:5000/api/Account/register'),
          headers: {'accept': 'text/plain'},
          body: {
            'RegisterTempDTO.AccountName': name,
            'RegisterTempDTO.AccountEmail': email,
            'RegisterTempDTO.AccountPhoneNumber': phoneNumber,
            'RegisterTempDTO.AccountPassword': password,
            'RegisterTempDTO.AccountGender': gender,
            'RegisterTempDTO.AccountDob': DateFormat('yyyy-MM-dd').format(dob!),
            'RegisterTempDTO.AccountAddress': address,
            'RegisterTempDTO.AccountImage': 'default.jpg',
          },
        );

        final result = jsonDecode(response.body);
        if (response.statusCode == 200 && result['flag']) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('Registration Successful!'),
              content: Text('Please log in.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/login'),
                  child: Text('OK'),
                ),
              ],
            ),
          );
        } else {
          _showError(
              result['message'] ?? 'Registration failed. Please try again.');
        }
      } catch (error) {
        _showError(error.toString());
      }
    }
  }

  void _showError(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: Center(
        child: SingleChildScrollView(
          child: Card(
            margin: EdgeInsets.all(16),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Register',
                      style:
                          TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Name'),
                      validator: (value) =>
                          value!.isEmpty ? 'Name is required' : null,
                      onSaved: (value) => name = value!,
                    ),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value!.isEmpty) return 'Email is required';
                        final emailRegex = RegExp(
                            r'^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$');
                        return emailRegex.hasMatch(value)
                            ? null
                            : 'Enter a valid email';
                      },
                      onSaved: (value) => email = value!,
                    ),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Phone Number'),
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value!.isEmpty) return 'Phone number is required';
                        final phoneRegex = RegExp(r'^0\d{9}$');
                        return phoneRegex.hasMatch(value)
                            ? null
                            : 'Enter a valid phone number';
                      },
                      onSaved: (value) => phoneNumber = value!,
                    ),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Password'),
                      obscureText: true,
                      validator: (value) => value!.length < 6
                          ? 'Password must be at least 6 characters'
                          : null,
                      onSaved: (value) => password = value!,
                    ),
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(labelText: 'Gender'),
                      items: [
                        DropdownMenuItem(value: 'male', child: Text('Male')),
                        DropdownMenuItem(
                            value: 'female', child: Text('Female')),
                      ],
                      onChanged: (value) => gender = value!,
                      validator: (value) =>
                          value == null ? 'Gender is required' : null,
                    ),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Date of Birth'),
                      readOnly: true,
                      onTap: () async {
                        final pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(1900),
                          lastDate: DateTime.now(),
                        );
                        if (pickedDate != null) {
                          setState(() => dob = pickedDate);
                        }
                      },
                      validator: (value) =>
                          dob == null ? 'Date of Birth is required' : null,
                      controller: TextEditingController(
                        text: dob == null
                            ? ''
                            : DateFormat('yyyy-MM-dd').format(dob!),
                      ),
                    ),
                    TextFormField(
                      decoration: InputDecoration(labelText: 'Address'),
                      validator: (value) =>
                          value!.isEmpty ? 'Address is required' : null,
                      onSaved: (value) => address = value!,
                    ),
                    SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _register,
                      child: Text('REGISTER'),
                    ),
                    SizedBox(height: 16),
                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      child: Text('Already have an account? Login here'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
