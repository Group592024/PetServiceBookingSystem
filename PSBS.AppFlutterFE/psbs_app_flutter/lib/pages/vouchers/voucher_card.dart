import 'package:flutter/material.dart';
import '../../models/voucher.dart';

class VoucherCard extends StatelessWidget {
  final Voucher voucher;
  final String basePath;

  VoucherCard({required this.voucher, required this.basePath});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/customer/vouchers/detail', // No ID in the URL
          arguments: voucher, // Pass the entire voucher object
        );
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            // Use const for better performance
            colors: [Colors.blue, Colors.teal],
            begin: Alignment.topLeft, // Align gradient like React example
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            // Use const
            BoxShadow(color: Colors.black26, blurRadius: 5),
          ],
        ),
        padding: const EdgeInsets.all(16), // Use const
        child: Row(
          // Use Row for icon and text side-by-side
          crossAxisAlignment: CrossAxisAlignment.center, // Center vertically
          children: [
            Expanded(
              // Use Expanded to handle text wrapping
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min, // Important for text wrapping
                children: [
                  Text(
                    voucher.voucherName,
                    style: const TextStyle(
                      // Use const
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    "${voucher.voucherDiscount.toStringAsFixed(0)}% OFF",
                    style: const TextStyle(
                      // Use const
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              // Narrow Icon
              Icons.chevron_right,
              color: Colors.white,
              size: 30,
            ),
          ],
        ),
      ),
    );
  }
}
