import 'package:flutter/material.dart';

class PetPage extends StatelessWidget {
  const PetPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Text(
          'Pet',
          style: TextStyle(
              fontSize: 60,
              color: Colors.white,
              backgroundColor: Colors.blueAccent),
        ),
      ),
    );
  }
}
