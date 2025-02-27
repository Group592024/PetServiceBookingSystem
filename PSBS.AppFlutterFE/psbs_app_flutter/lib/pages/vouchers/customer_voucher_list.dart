import 'package:flutter/material.dart';
import '../../services/voucher_service.dart';
import '../../models/voucher.dart';
import '../vouchers/voucher_card.dart';

class CustomerVoucherList extends StatefulWidget {
  @override
  _CustomerVoucherListState createState() => _CustomerVoucherListState();
}

class _CustomerVoucherListState extends State<CustomerVoucherList> {
  List<Voucher> vouchers = [];
  bool isLoading = true;
  final String basePath = "/customer/vouchers";

  @override
  void initState() {
    super.initState();
    _fetchVouchers();
  }

  void _fetchVouchers() async {
    try {
      List<Voucher> data = await VoucherService.fetchVouchers();
      setState(() {
        vouchers = data;
        isLoading = false;
      });
    } catch (error) {
      print("Error fetching vouchers: $error");
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Vouchers'),
        backgroundColor: Colors.blue,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : vouchers.isEmpty
              ? Center(
                  child: Text(
                    "No vouchers available at the moment.",
                    style: TextStyle(fontSize: 16),
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: GridView.builder(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8.0,
                      mainAxisSpacing: 8.0,
                      childAspectRatio: 3 / 2,
                    ),
                    itemCount: vouchers.length,
                    itemBuilder: (context, index) {
                      return VoucherCard(
                        voucher: vouchers[index],
                        basePath: basePath,
                      );
                    },
                  ),
                ),
    );
  }
}
