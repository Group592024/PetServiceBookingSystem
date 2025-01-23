import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Text(
          'Home',
          style: TextStyle(
              fontSize: 60, color: Colors.white, backgroundColor: Colors.green),
        ),
      ),
    );
  }
}
