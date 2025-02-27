import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/models/user.dart';

class UserService {
  static Future<User?> fetchUser(String accountId) async {
    try {
      final response = await http
          .get(Uri.parse('http://192.168.2.28:5000/api/Account/$accountId'));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse =
            json.decode(response.body)['data'];
        return User.fromJson(jsonResponse);
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Failed to load user: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching user: $e');
      return null;
    }
  }
   static Future<List<User>> fetchAllUsers() async {
    try {
      final response =
          await http.get(Uri.parse('http://192.168.2.28:5000/api/Account/all'));

      if (response.statusCode == 200) {
        final List<dynamic> jsonResponse = json.decode(response.body)['data'];
        return jsonResponse.map((userJson) => User.fromJson(userJson)).toList();
      } else {
        throw Exception('Failed to load all users: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching all users: $e');
      return []; // Return an empty list in case of error
    }
  }
}
