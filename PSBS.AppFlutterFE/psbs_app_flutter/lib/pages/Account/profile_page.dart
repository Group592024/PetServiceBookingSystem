import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

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
      final response = await http.get(
        Uri.parse('http://localhost:5000/api/Account?AccountId=${widget.accountId}'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print("Account Data: $data");

        setState(() {
          account = data;  // Access the data directly
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
        Uri.parse('http://localhost:5000/api/Account/loadImage?filename=$filename'),
      );

      if (imageResponse.statusCode == 200) {
        final imageData = jsonDecode(imageResponse.body);
        if (imageData['flag']) {
          setState(() {
            imagePreview = "data:image/png;base64,${imageData['data']['fileContents']}";
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
  String formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year;
    return '$day/$month/$year';
  }

  @override
  Widget build(BuildContext context) {
    if (account == null) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 80,
                  backgroundImage:
                      imagePreview != null ? NetworkImage(imagePreview!) : null,
                  child: imagePreview == null
                      ? Icon(Icons.person, size: 80)
                      : null,
                ),
              ],
            ),
            SizedBox(height: 16),
            Text(account!['accountName'],
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            ProfileDetail(label: "Name", value: account!['accountName']),
            ProfileDetail(label: "Email", value: account!['accountEmail']),
            ProfileDetail(label: "Date of Birth", value: formatDate(account!['accountDob'])),
            ProfileDetail(label: "Gender", value: account!['accountGender']),
            ProfileDetail(label: "Phone Number", value: account!['accountPhoneNumber']),
            ProfileDetail(label: "Address", value: account!['accountAddress']),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    // Navigate to edit profile page
                  },
                  child: Text('Edit'),
                ),
                ElevatedButton(
                  onPressed: () {
                    // Navigate to change password page
                  },
                  child: Text('Change Password'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileDetail extends StatelessWidget {
  final String label;
  final String value;

  const ProfileDetail({Key? key, required this.label, required this.value})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Text('$label: ', style: TextStyle(fontWeight: FontWeight.bold)),
          Text(value),
        ],
      ),
    );
  }
}
