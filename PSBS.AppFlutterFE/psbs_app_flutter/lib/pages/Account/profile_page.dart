import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:intl/intl.dart';

class ProfilePage extends StatefulWidget {
  final String accountId;

  const ProfilePage({Key? key, required this.accountId}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? account;
  String? imagePreview;

  @override
  void initState() {
    super.initState();
    fetchAccountData();
  }

  Future<void> fetchAccountData() async {
    try {
      print("Sending request to API...");
      final response = await http.get(
        Uri.parse(
            'http://localhost:5000/api/Account?AccountId=d16f43b2-17cf-4a1e-8d9a-16fa813a13fb'),
      );
      print("Received response: ${response.statusCode}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print("Account Data: $data");

        setState(() {
          account = data;
          if (account?['accountImage'] != null) {
            fetchImage(account?['accountImage']);
          }
        });
      } else {
        print("Error fetching account data: ${response.statusCode}");
      }
    } catch (error) {
      print("Error calling API: $error");
    }
  }

  // Fetch profile image
  Future<void> fetchImage(String filename) async {
    try {
      final imageResponse = await http.get(
        Uri.parse(
            'http://localhost:5000/api/Account/loadImage?filename=$filename'),
      );

      if (imageResponse.statusCode == 200) {
        final imageData = jsonDecode(imageResponse.body);
        if (imageData['flag']) {
          setState(() {
            imagePreview =
                "data:image/png;base64,${imageData['data']['fileContents']}";
          });
        }
      } else {
        print("Error fetching image: ${imageResponse.statusCode}");
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
              // Avatar + Tên
              Container(
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
                      backgroundImage: imagePreview != null ? NetworkImage(imagePreview!) : null,
                      child: imagePreview == null ? Icon(Icons.person, size: 80, color: Colors.grey) : null,
                    ),
                    SizedBox(height: 10),
                    Text(
                      account?['accountName'],
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 16),

              // Thông tin cá nhân
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
                ),
                child: Column(
                  children: [
                    ProfileField(label: "Name", value: account?['accountName']),
                    ProfileField(label: "Email", value: account?['accountEmail']),
                    ProfileField(label: "Birthday", value: formatDate(account?['accountDob'])),
                    GenderField(selectedGender: account?['accountGender']),
                    ProfileField(label: "Phone Number", value: account?['accountPhoneNumber']),
                    ProfileField(label: "Address", value: account?['accountAddress']),
                  ],
                ),
              ),

              SizedBox(height: 16),

              // Nút Edit & Change Password
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, "");
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: Text("Edit", style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, "");
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[400],
                      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: Text("Change Password", style: TextStyle(color: Colors.black, fontSize: 16)),
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

// Widget hiển thị thông tin từng dòng
class ProfileField extends StatelessWidget {
  final String label;
  final String value;

  const ProfileField({Key? key, required this.label, required this.value}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black)),
          SizedBox(height: 4),
          TextField(
            controller: TextEditingController(text: value),
            enabled: false,
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

// Widget hiển thị radio chọn giới tính
class GenderField extends StatelessWidget {
  final String selectedGender;

  const GenderField({Key? key, required this.selectedGender}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Gender", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black)),
        Row(
          children: [
            Expanded(
              child: RadioListTile(
                title: Text("Male"),
                value: "male",
                groupValue: selectedGender,
                onChanged: null, // Disabled
              ),
            ),
            Expanded(
              child: RadioListTile(
                title: Text("Female"),
                value: "female",
                groupValue: selectedGender,
                onChanged: null, // Disabled
              ),
            ),
          ],
        ),
      ],
    );
  }
}

