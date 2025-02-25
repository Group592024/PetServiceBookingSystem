import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GiftDetailPage extends StatefulWidget {
  final String giftId;

  const GiftDetailPage({Key? key, required this.giftId}) : super(key: key);

  @override
  _GiftDetailPageState createState() => _GiftDetailPageState();
}

class _GiftDetailPageState extends State<GiftDetailPage> {
  Map<String, dynamic>? gift;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchGiftDetail();
  }

  Future<void> fetchGiftDetail() async {
    final String apiUrl = 'http://127.0.0.1:5022/Gifts/detail/${widget.giftId}';
    try {
      final response = await http.get(Uri.parse(apiUrl));
      final data = json.decode(response.body);

      if (data['flag']) {
        setState(() {
          gift = data['data'];
          isLoading = false;
        });
      } else {
        setState(() {
          error = data['message'];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'An error occurred while fetching gift details.';
        isLoading = false;
      });
    }
  }

  void handleRedeem() async {
    final String redeemUrl =
        'http://127.0.0.1:5022/Gifts/redeem/${widget.giftId}';

    try {
      final response = await http.post(Uri.parse(redeemUrl));
      final data = json.decode(response.body);

      if (data['flag']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gift redeemed successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? 'Redeem failed!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('An error occurred while redeeming the gift.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gift Details')),
      body: Center(
        child: isLoading
            ? const CircularProgressIndicator()
            : error != null
                ? Text(
                    error!,
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                    textAlign: TextAlign.center,
                  )
                : Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            'http://127.0.0.1:5022${gift!['giftImage']}',
                            width: 200,
                            height: 200,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(Icons.image_not_supported, size: 100),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          gift!['giftName'],
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Points: ${gift!['giftPoint']}",
                          style: const TextStyle(fontSize: 18),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Gift Code: ${gift!['giftCode'] ?? "N/A"}",
                          style: const TextStyle(fontSize: 18),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Description: ${gift!['giftDescription'] ?? "No description available"}",
                          style: const TextStyle(fontSize: 16),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 30),
                        ElevatedButton(
                          onPressed: handleRedeem,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 30, vertical: 12),
                            textStyle: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text('Redeem Gift'),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
