import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/redeem_history.dart';

class RedeemService {
  static const String _baseUrl = "http://10.0.2.2:5050";

  static Future<List<RedeemHistory>> fetchRedeemHistories(
      String accountId) async {
    try {
      final response =
          await http.get(Uri.parse("$_baseUrl/redeemhistory/app/$accountId"));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['flag'] == true && jsonResponse['data'] != null) {
          List<dynamic> data = jsonResponse['data'];
          return data.map((gift) => RedeemHistory.fromJson(gift)).toList();
        } else {
          // Return an empty list instead of throwing an exception
          return [];
        }
      } else {
        throw Exception("Failed to load gifts: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Error fetching gifts: $e");
    }
  }
  static Future<bool> cancelRedemption(
      String accountId, String giftId, int requiredPoints) async {
    try {
      final response = await http.put(
        Uri.parse("$_baseUrl/api/Account/refundPoint?accountId=$accountId"),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'giftId': giftId,
          'requiredPoints': requiredPoints,
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse['flag'] == true;
      } else {
        throw Exception(
            "Failed to cancel redemption: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Error cancelling redemption: $e");
    }
  }
}
