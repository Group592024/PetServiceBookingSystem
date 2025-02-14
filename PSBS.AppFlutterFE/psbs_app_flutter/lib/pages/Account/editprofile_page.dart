import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage(
      {super.key, required String title, required String accountId});

  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  TextEditingController nameController = TextEditingController();
  TextEditingController phoneController = TextEditingController();
  TextEditingController addressController = TextEditingController();
  String accountId = '';
  String? email;
  String role = "user";
  String gender = "male";
  DateTime? dob;
  File? profileImage;
  String? imagePreview;
  
  get filename => null;

  @override
  void initState() {
    super.initState();
    _loadAccountId();
  }

  Future<void> _loadAccountId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      accountId = prefs.getString('accountId') ?? '';
    });
    if (accountId.isNotEmpty) {
      _fetchAccountData();
    }
  }

  Future<void> _fetchAccountData() async {
    if (accountId.isEmpty) return;
    try {
      final response = await http.get(
        Uri.parse('http://localhost:5000/api/Account?AccountId=$accountId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          nameController.text = data['accountName'] ?? '';
          email = data['accountEmail'];
          phoneController.text = data['accountPhoneNumber'] ?? '';
          addressController.text = data['accountAddress'] ?? '';
          gender = data['accountGender'] ?? 'male';
          role = data['roleId'] ?? 'user';
          dob = data['accountDob'] != null
              ? DateTime.parse(data['accountDob'])
              : null;
          imagePreview = data['accountImage'] != null
              ? 'http://localhost:5000/api/Account/loadImage?filename=$filename'
              : null;
        });
      } else {
        _showErrorDialog('Failed to load account data.');
      }
    } catch (error) {
      _showErrorDialog('Error fetching account data: $error');
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final request = http.MultipartRequest(
        'PUT',
        Uri.parse('http://localhost:5000/api/Account'),
      );

      request.fields['AccountTempDTO.AccountId'] = accountId;
      request.fields['AccountTempDTO.AccountName'] = nameController.text;
      request.fields['AccountTempDTO.AccountEmail'] = email ?? '';
      request.fields['AccountTempDTO.AccountPhoneNumber'] =
          phoneController.text;
      request.fields['AccountTempDTO.AccountGender'] = gender;
      request.fields['AccountTempDTO.AccountDob'] =
          dob != null ? DateFormat('yyyy-MM-dd').format(dob!) : '';
      request.fields['AccountTempDTO.AccountAddress'] = addressController.text;
      request.fields['AccountTempDTO.roleId'] = role;

      // Send the profile image if a new image is picked
      if (profileImage != null) {
        request.files.add(await http.MultipartFile.fromPath(
          'UploadModel.ImageFile',
          profileImage!.path,
        ));
      }

      final response = await request.send();

      if (response.statusCode == 200) {
        final result = json.decode(await response.stream.bytesToString());
        if (result['flag']) {
          _showSuccessDialog('Profile updated successfully!');
        } else {
          _showErrorDialog(result['message'] ?? 'Something went wrong.');
        }
      } else {
        _showErrorDialog('Error saving profile.');
      }
    } catch (error) {
      _showErrorDialog('Error: $error');
    }
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        profileImage = File(pickedFile.path);
        imagePreview = null; // Reset image preview when selecting a new image
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Success'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
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
        title: const Text('Edit Profile'),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
                ),
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: _pickImage,
                      child: CircleAvatar(
                        radius: 80,
                        backgroundImage: imagePreview != null
                            ? NetworkImage(imagePreview!)
                            : null,
                        child: imagePreview == null
                            ? Icon(Icons.person, size: 80, color: Colors.grey)
                            : null,
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      nameController.text,
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ProfileField(label: 'Name', controller: nameController),
              const SizedBox(height: 20),
              ProfileField(
                  label: 'Email',
                  controller: TextEditingController(text: email),
                  enabled: false),
              const SizedBox(height: 20),
              TextFormField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Birthday',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      final selectedDate = await showDatePicker(
                        context: context,
                        initialDate: dob ?? DateTime.now(),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (selectedDate != null) {
                        setState(() => dob = selectedDate);
                      }
                    },
                  ),
                ),
                controller: TextEditingController(
                  text:
                      dob != null ? DateFormat('dd/MM/yyyy').format(dob!) : '',
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const Text("Gender:",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Row(
                      children: [
                        Expanded(
                          child: ListTile(
                            title: const Text('Male'),
                            leading: Radio<String>(
                              value: 'male',
                              groupValue: gender,
                              onChanged: (value) =>
                                  setState(() => gender = value!),
                            ),
                          ),
                        ),
                        Expanded(
                          child: ListTile(
                            title: const Text('Female'),
                            leading: Radio<String>(
                              value: 'female',
                              groupValue: gender,
                              onChanged: (value) =>
                                  setState(() => gender = value!),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ProfileField(label: 'Phone Number', controller: phoneController),
              const SizedBox(height: 20),
              ProfileField(label: 'Address', controller: addressController),
              const SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      padding:
                          EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text("Save",
                        style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey,
                      padding:
                          EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text("Back",
                        style: TextStyle(color: Colors.white, fontSize: 16)),
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

class ProfileField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool enabled;

  const ProfileField({
    super.key,
    required this.label,
    required this.controller,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.black)),
          const SizedBox(height: 4),
          TextFormField(
            controller: controller,
            enabled: enabled,
            decoration: InputDecoration(
              border: OutlineInputBorder(),
              filled: true,
              fillColor: Colors.grey[100],
            ),
          ),
        ],
      ),
    );
  }
}
