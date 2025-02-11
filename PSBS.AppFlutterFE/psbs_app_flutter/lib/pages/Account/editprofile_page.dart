import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class EditProfilePage extends StatefulWidget {
  final String accountId;

  const EditProfilePage({Key? key, required this.accountId}) : super(key: key);

  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  Map<String, dynamic>? account;
  String? imagePreview;
  final _formKey = GlobalKey<FormState>();
  TextEditingController? nameController;
  TextEditingController? emailController;
  TextEditingController? phoneController;
  TextEditingController? addressController;
  String? selectedGender;
  File? _image;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    fetchAccountData();
  }

  // Fetch account data from API
  Future<void> fetchAccountData() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:5000/api/Account?AccountId=${widget.accountId}'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          account = data;
          if (account?['accountImage'] != null) {
            fetchImage(account?['accountImage']);
          }

          // Initialize controllers with fetched data
          nameController = TextEditingController(text: account?['accountName']);
          emailController = TextEditingController(text: account?['accountEmail']);
          phoneController = TextEditingController(text: account?['accountPhoneNumber']);
          addressController = TextEditingController(text: account?['accountAddress']);
          selectedGender = account?['accountGender'];
        });
      }
    } catch (error) {
      print("Error calling API: $error");
    }
  }

  // Fetch profile image
  Future<void> fetchImage(String filename) async {
    try {
      final imageResponse = await http.get(
        Uri.parse('http://localhost:5000/api/Account/loadImage?filename=$filename'),
      );

      if (imageResponse.statusCode == 200) {
        final imageData = jsonDecode(imageResponse.body);
        if (imageData['flag']) {
          setState(() {
            imagePreview = "data:image/png;base64,${imageData['data']['fileContents']}";
          });
        }
      }
    } catch (error) {
      print("Error fetching image: $error");
    }
  }

  // Format date of birth
  String formatDate(String date) {
    try {
      DateTime parsedDate = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy').format(parsedDate);
    } catch (e) {
      return date;
    }
  }

  // Handle image selection from gallery
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
      });
    }
  }

  // Update profile API
  // Update profile API
Future<void> updateProfile() async {
  try {
    final uri = Uri.parse('http://localhost:5000/api/Account');
    var request = http.MultipartRequest('PUT', uri);

    // Prepare the profile data
    request.fields['accountId'] = widget.accountId;
    request.fields['accountName'] = nameController?.text ?? '';
    request.fields['accountEmail'] = emailController?.text ?? '';
    request.fields['accountPhoneNumber'] = phoneController?.text ?? '';
    request.fields['accountAddress'] = addressController?.text ?? '';
    request.fields['accountGender'] = selectedGender ?? '';

    // Log the profile data before sending
    print("Request Profile Data: ${request.fields}");

    // Add image file if available
    if (_image != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'accountImage', _image!.path,
      ));
    }

    // Send the request
    final response = await request.send();

    // Log the response status code
    print("Response Status Code: ${response.statusCode}");

    if (response.statusCode == 200) {
      final responseBody = await response.stream.bytesToString();
      final data = jsonDecode(responseBody);

      // Log the response body
      print("Response Body: $data");

      if (data['status'] == 'success') {
        // Successfully updated
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Profile updated successfully")));
      } else {
        // Update failed
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to update profile")));
      }
    } else {
      // Log error response
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error updating profile: ${response.statusCode}")));
      print("Error updating profile, status code: ${response.statusCode}");
    }
  } catch (error) {
    // Log the error
    print("Error updating profile: $error");
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error updating profile")));
  }
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Profile', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              // Avatar + Name
              GestureDetector(
                onTap: _pickImage, // Pick an image when tapped
                child: Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 80,
                        backgroundImage: _image != null
                            ? FileImage(_image!)
                            : imagePreview != null
                                ? NetworkImage(imagePreview!)
                                : null,
                        child: _image == null && imagePreview == null
                            ? Icon(Icons.person, size: 80, color: Colors.grey)
                            : null,
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Editable personal information
              Form(
                key: _formKey,
                child: Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
                  ),
                  child: Column(
                    children: [
                      ProfileField(label: "Name", controller: nameController),
                      ProfileField(label: "Email", controller: emailController, enabled: false),
                      ProfileField(label: "Birthday", value: formatDate(account?['accountDob'])),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            Text("Gender", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black)),
                            SizedBox(width: 16),
                            Radio<String>(
                              value: 'male',
                              groupValue: selectedGender,
                              onChanged: (value) {
                                setState(() {
                                  selectedGender = value;
                                });
                              },
                            ),
                            Text("Male"),
                            SizedBox(width: 16),
                            Radio<String>(
                              value: 'female',
                              groupValue: selectedGender,
                              onChanged: (value) {
                                setState(() {
                                  selectedGender = value;
                                });
                              },
                            ),
                            Text("Female"),
                          ],
                        ),
                      ),
                      ProfileField(label: "Phone Number", controller: phoneController),
                      ProfileField(label: "Address", controller: addressController),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Edit button to update profile
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState?.validate() ?? false) {
                        updateProfile();
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text("Save", style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context); // Go back to the previous screen
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey,
                      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text("Back", style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Widget to display editable profile fields
class ProfileField extends StatelessWidget {
  final String label;
  final String? value;
  final TextEditingController? controller;
  final bool enabled;

  const ProfileField({Key? key, required this.label, this.value, this.controller, this.enabled = true}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black)),
          SizedBox(height: 4),
          TextFormField(
            controller: controller,
            initialValue: value,
            enabled: enabled,
            decoration: InputDecoration(
              border: OutlineInputBorder(),
              filled: true,
              fillColor: Colors.white,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return '$label is required';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
