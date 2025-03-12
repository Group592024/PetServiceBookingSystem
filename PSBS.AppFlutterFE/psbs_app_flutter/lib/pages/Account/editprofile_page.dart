import 'dart:convert';
import 'dart:io';
import 'package:http_parser/http_parser.dart';
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
  bool isImagePicked = false;
  File? profileImage;
  String? imagePreview;
  Map<String, dynamic>? account;
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
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/Account?AccountId=$accountId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
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

          if (data['accountImage'] != null) {
            fetchImage(data['accountImage']);
          }
        });
      } else {
        _showErrorDialog('Failed to load account data.');
      }
    } catch (error) {
      _showErrorDialog('Error fetching account data: $error');
    }
  }

  Future<void> fetchImage(String filename) async {
    if (filename.isEmpty) return;

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final imageResponse = await http.get(
        Uri.parse(
            'http://10.0.2.2:5050/api/Account/loadImage?filename=$filename'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (imageResponse.statusCode == 200) {
        final imageData = jsonDecode(imageResponse.body);
        if (imageData['flag'] && imageData['data']?['fileContents'] != null) {
          String base64String = imageData['data']['fileContents'];
          if (base64String.contains(",")) {
            base64String = base64String.split(",")[1];
          }
          setState(() {
            imagePreview = base64String;
          });
        }
      }
    } catch (error) {
      print("Error fetching image: $error");
    }
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      // Manually extract the filename from the path
      String fileName = pickedFile.path.split('/').last;

      setState(() {
        profileImage =
            File(pickedFile.path); // Keep the full path for uploading the image
        imagePreview = null;
        isImagePicked = true;
      });

      print("Selected image file name: $fileName"); // Print the file name
    } else {
      setState(() {
        isImagePicked = false;
      });
      print("No image selected.");
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final request = http.MultipartRequest(
        'PUT',
        Uri.parse('http://10.0.2.2:5050/api/Account'),
      );

      // Thêm header vào request
      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Content-Type'] = 'application/json';

      // Gửi dữ liệu văn bản
      request.fields['accountTempDTO.accountId'] = accountId;
      request.fields['accountTempDTO.accountName'] = nameController.text;
      request.fields['accountTempDTO.accountEmail'] = email ?? '';
      request.fields['accountTempDTO.accountPhoneNumber'] =
          phoneController.text;
      request.fields['accountTempDTO.accountGender'] = gender;
      request.fields['accountTempDTO.accountDob'] =
          dob != null ? DateFormat('yyyy-MM-dd').format(dob!) : '';
      request.fields['accountTempDTO.accountAddress'] = addressController.text;
      request.fields['accountTempDTO.isPickImage'] = isImagePicked.toString();
      request.fields['accountTempDTO.roleId'] = role;

      if (isImagePicked && profileImage != null) {
        var file = await http.MultipartFile.fromPath(
          'uploadModel.imageFile',
          profileImage!.path,
          filename: profileImage!.path.split('/').last,
          contentType: MediaType('image', 'jpeg'),
        );
        request.files.add(file);
      }

      final response = await request.send();
      final responseCompleted = await http.Response.fromStream(response);

      if (response.statusCode == 200) {
        final result = json.decode(responseCompleted.body);
        if (result['flag']) {
          _showSuccessDialog('Profile updated successfully!');
        } else {
          _showErrorDialog(result['message'] ?? 'Something went wrong.');
        }
      } else {
        _showErrorDialog('Failed to update profile.');
      }
    } catch (error) {
      _showErrorDialog('Error: $error');
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
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop(
                  true); // Quay về trang Profile và truyền kết quả thành công
            },
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
        title: Text('Profile',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.black),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
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
                        backgroundImage: (profileImage != null)
                            ? FileImage(
                                profileImage!) // Sử dụng FileImage khi có profileImage
                            : (imagePreview != null && imagePreview!.isNotEmpty)
                                ? MemoryImage(base64Decode(
                                    imagePreview!)) // Sử dụng base64 cho ảnh tải từ server
                                : null,
                        child: profileImage == null && imagePreview == null
                            ? Icon(Icons.person,
                                size: 80,
                                color: Colors
                                    .grey) // Nếu không có ảnh, hiển thị icon mặc định
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
                        Flexible(
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 4), // Giảm padding hai bên
                            title: const Text('Male'),
                            leading: Radio<String>(
                              value: 'male',
                              groupValue: gender,
                              onChanged: (value) =>
                                  setState(() => gender = value!),
                            ),
                          ),
                        ),
                        const SizedBox(
                            width: 8), // Giảm khoảng cách giữa hai ListTile
                        Flexible(
                          child: ListTile(
                            contentPadding:
                                const EdgeInsets.symmetric(horizontal: 4),
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
