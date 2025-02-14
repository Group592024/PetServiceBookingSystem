import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

class ForgotPasswordPage extends StatefulWidget {
  @override
  _ForgotPasswordPageState createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool isLoading = false;

  void handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      isLoading = true;
    });

    try {
      final dio = Dio();
      final response = await dio.post(
        'http://localhost:5000/api/Account/ForgotPassword',
        queryParameters: {'email': emailController.text.trim()},
      );

      if (response.data != null && response.data['flag'] == true) {
        Fluttertoast.showToast(
          msg: response.data['message'],
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.CENTER,
          backgroundColor: Colors.green,
          textColor: Colors.white,
        );
      } else {
        Fluttertoast.showToast(
          msg: 'Something went wrong, please try again.',
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.CENTER,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
      }
    } on DioError catch (error) {
      String errorMessage = error.response?.data['message'] ??
          'An error occurred. Please try again later.';
      Fluttertoast.showToast(
        msg: errorMessage,
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.CENTER,
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }
  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    final regex = RegExp(r'^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$');
    if (!regex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, 
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding:
                      EdgeInsets.symmetric(vertical: 32.0, horizontal: 48.0),
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
                Card(
                  color: Colors.white,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16.0)), 
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.center, 
                        children: [
                          Text(
                            "Forgot Password",
                            style: TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 8),
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: "Remember your password? ",
                                  style: TextStyle(
                                      fontSize: 14, color: Colors.black),
                                ),
                                TextSpan(
                                  text: "Login here",
                                  style: TextStyle(
                                      fontSize: 14, color: Colors.cyan),
                                  recognizer: TapGestureRecognizer()
                                    ..onTap = () {
                                      Navigator.pushNamed(context, '/login');
                                    },
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: emailController,
                            decoration: InputDecoration(
                              labelText: "Email address",
                              labelStyle:
                                  TextStyle(color: Colors.black), 
                              filled: true,
                              fillColor: Colors.grey[100], 
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(
                                    12.0), 
                              ),
                            ),
                            validator: validateEmail,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          SizedBox(height: 16),
                         
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: isLoading ? null : handleSubmit,
                              style: ElevatedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                      12.0), 
                                ),
                                backgroundColor: Colors.cyan,
                              ),
                              child: isLoading
                                  ? CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.white),
                                    )
                                  : Text("Reset Password",
                                      style: TextStyle(color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
