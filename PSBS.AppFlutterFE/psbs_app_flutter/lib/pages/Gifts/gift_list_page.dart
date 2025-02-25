import 'package:flutter/material.dart';
import '../../models/gift.dart';
import '../../services/gift_service.dart';
import 'gift_detail_page.dart';

class GiftListScreen extends StatefulWidget {
  @override
  _GiftListScreenState createState() => _GiftListScreenState();
}

class _GiftListScreenState extends State<GiftListScreen> {
  late Future<List<Gift>> _giftsFuture;

  @override
  void initState() {
    super.initState();
    _giftsFuture = GiftService.fetchGifts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Gift List")),
      body: FutureBuilder<List<Gift>>(
        future: _giftsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("No gifts available"));
          }

          List<Gift> gifts = snapshot.data!;
          return ListView.builder(
            itemCount: gifts.length,
            itemBuilder: (context, index) {
              var gift = gifts[index];
              return GestureDetector(
                onTap: () {
                  // Navigate to GiftDetailPage
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GiftDetailPage(giftId: gift.giftId),
                    ),
                  );
                },
                child: Card(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Image.network(
                          "http://127.0.0.1:5022${gift.giftImage}",
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.broken_image, size: 50),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(gift.giftName,
                                  style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(gift.giftDescription,
                                  maxLines: 2, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                        Text("Points: ${gift.giftPoint}",
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
