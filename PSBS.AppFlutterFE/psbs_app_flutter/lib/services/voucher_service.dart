import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/voucher.dart';

class VoucherService {
  static Future<List<Voucher>> fetchVouchers() async {
    final response = await http
        .get(Uri.parse('http://192.168.2.28:5022/api/Voucher/customer'));

    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body)['data'];
      return jsonResponse.map((voucher) => Voucher.fromJson(voucher)).toList();
    } else {
      throw Exception('Failed to load vouchers');
    }
  }
}
