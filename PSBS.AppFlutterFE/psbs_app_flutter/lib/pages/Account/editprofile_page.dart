import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

class EditProfile extends StatefulWidget {
  final String accountId;

  const EditProfile({Key? key, required this.accountId}) : super(key: key);

  @override
  _EditProfileState createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  final _formKey = GlobalKey<FormState>();

  TextEditingController nameController = TextEditingController();
  TextEditingController phoneController = TextEditingController();
  TextEditingController addressController = TextEditingController();

  String? email;
  String role = "user";
  String gender = "male";
  DateTime? dob;
  File? profileImage;
  String? imagePreview;

  Map<String, String> errors = {};

  @override
  void initState() {
    super.initState();
    _fetchAccountData();
  }

  Future<void> _fetchAccountData() async {
    try {
      final response = await http.get(Uri.parse(
          'http://localhost:5000/api/Account?AccountId=${widget.accountId}'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

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
              ? 'http://localhost:5000/api/Account/loadImage?filename=${data['accountImage']}'
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
      final request = http.MultipartRequest('PUT', Uri.parse('http://localhost:5000/api/Account'));

      request.fields['AccountTempDTO.AccountId'] = widget.accountId;
      request.fields['AccountTempDTO.AccountName'] = nameController.text;
      request.fields['AccountTempDTO.AccountEmail'] = email ?? '';
      request.fields['AccountTempDTO.AccountPhoneNumber'] = phoneController.text;
      request.fields['AccountTempDTO.AccountGender'] = gender;
      request.fields['AccountTempDTO.AccountDob'] = dob != null
          ? DateFormat('yyyy-MM-dd').format(dob!)
          : '';
      request.fields['AccountTempDTO.AccountAddress'] = addressController.text;
      request.fields['AccountTempDTO.roleId'] = role;
      
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
    final pickedFile = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        profileImage = File(pickedFile.path);
        imagePreview = null; // Clear URL-based preview.
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
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: CircleAvatar(
                  radius: 80,
                  backgroundImage: profileImage != null
                      ? FileImage(profileImage!)
                      : (imagePreview != null
                          ? NetworkImage(imagePreview!) as ImageProvider
                          : null),
                  child: profileImage == null && imagePreview == null
                      ? const Icon(Icons.add_a_photo, size: 50)
                      : null,
                ),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Name is required'
                    : null,
              ),
              const SizedBox(height: 20),
              TextFormField(
                initialValue: email,
                decoration: const InputDecoration(labelText: 'Email'),
                enabled: false,
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: role,
                items: const [
                  DropdownMenuItem(value: 'user', child: Text('User')),
                  DropdownMenuItem(value: 'admin', child: Text('Admin')),
                  DropdownMenuItem(value: 'staff', child: Text('Staff')),
                ],
                onChanged: (value) => setState(() => role = value ?? 'user'),
                decoration: const InputDecoration(labelText: 'Role'),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Phone number is required'
                    : null,
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: addressController,
                decoration: const InputDecoration(labelText: 'Address'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Address is required'
                    : null,
              ),
              const SizedBox(height: 20),
              ListTile(
                title: const Text('Male'),
                leading: Radio<String>(
                  value: 'male',
                  groupValue: gender,
                  onChanged: (value) => setState(() => gender = value!),
                ),
              ),
              ListTile(
                title: const Text('Female'),
                leading: Radio<String>(
                  value: 'female',
                  groupValue: gender,
                  onChanged: (value) => setState(() => gender = value!),
                ),
              ),
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
                  text: dob != null ? DateFormat('dd/MM/yyyy').format(dob!) : '',
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _saveProfile,
                child: const Text('Save'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
