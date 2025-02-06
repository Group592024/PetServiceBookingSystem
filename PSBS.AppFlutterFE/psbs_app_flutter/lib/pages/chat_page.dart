import 'package:flutter/material.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Text(
          'Chat',
          style: TextStyle(fontSize: 60, color: Colors.white, backgroundColor: Colors.teal),
        ),
      ),
    );
  }
}
