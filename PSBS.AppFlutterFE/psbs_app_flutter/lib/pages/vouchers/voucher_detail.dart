import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:psbs_app_flutter/models/voucher.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';

class VoucherDetailScreen extends StatelessWidget {
  final Voucher voucher;

  const VoucherDetailScreen({Key? key, required this.voucher})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Voucher Details'),
      ),
      body: Container(
        color: Colors.white, // Page background set to white
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Voucher Icon
              Center(
                child: Icon(
                  Icons.card_giftcard,
                  size: 80,
                  color: Colors.blue.shade300,
                ),
              ),
              const SizedBox(height: 16),

              // Section 1: Voucher Code
              _buildSectionTitle('Voucher Code'),
              const SizedBox(height: 8),
              _buildContainer(
                child: TextFormField(
                  readOnly: true,
                  initialValue: voucher.voucherCode,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                  decoration: InputDecoration(
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.copy),
                      onPressed: () {
                        Clipboard.setData(
                            ClipboardData(text: voucher.voucherCode));
                        Fluttertoast.showToast(
                          msg: "Copied to clipboard!",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM,
                          backgroundColor: Colors.black87,
                          textColor: Colors.white,
                          fontSize: 14.0,
                        );
                      },
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Section 2: Voucher Details in a Container
              _buildSectionTitle('Voucher Details'),
              _buildContainer(
                child: Column(
                  children: [
                    _buildDetailRow('Name:', voucher.voucherName),
                    _buildDivider(),
                    _buildDetailRow('Discount:',
                        '${voucher.voucherDiscount.toStringAsFixed(0)}%'),
                    if (voucher.voucherMaximum != null) _buildDivider(),
                    if (voucher.voucherMaximum != null)
                      _buildDetailRow('Maximum Discount:',
                          '${voucher.voucherMaximum!.toStringAsFixed(0)}'),
                    _buildDivider(),
                    _buildDetailRow('Minimum Spend:',
                        '${voucher.voucherMinimumSpend.toStringAsFixed(0)}'),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Section 3: Validity Period in a Container
              _buildSectionTitle('Validity Period'),
              _buildContainer(
                child: Column(
                  children: [
                    _buildDetailRow('Start Date:',
                        formatter.format(voucher.voucherStartDate)),
                    _buildDivider(),
                    _buildDetailRow(
                        'End Date:', formatter.format(voucher.voucherEndDate)),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Section 4: Description
              _buildSectionTitle('Description'),
              _buildContainer(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    voucher.voucherDescription,
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Helper function to build a section title
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 18,
        color: Colors.black,
      ),
    );
  }

  // Helper function to build a row with grey label and black content
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 1,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Align(
              alignment: Alignment.centerRight,
              child: Text(
                value,
                style: const TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.w600, // Increased font weight
                  fontSize: 16, // Slightly larger font
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper function to wrap content in a container
  Widget _buildContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade100, // Light grey background
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
          ),
        ],
      ),
      child: child,
    );
  }

  // Helper function to add a subtle divider between rows
  Widget _buildDivider() {
    return Divider(color: Colors.grey.shade300, thickness: 1, height: 10);
  }
}
