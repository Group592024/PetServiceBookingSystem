import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/gift.dart';

class GiftService {
  static const String _baseUrl = "http://10.0.2.2:5022"; 

  static Future<List<Gift>> fetchGifts() async {
    try {
      final response = await http.get(Uri.parse("$_baseUrl/Gifts"));

      if (response.statusCode == 200) {
        print("Response Body: ${response.body}");
      List jsonResponse = json.decode(response.body)['data'];
      return jsonResponse.map((gift) => Gift.fromJson(gift)).toList();
        // return Gift.fromJsonList(response.body);
      } else {
        throw Exception("Failed to load gifts: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Error fetching gifts: $e");
    }
  }
}
