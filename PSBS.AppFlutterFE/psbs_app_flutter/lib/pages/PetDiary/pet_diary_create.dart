import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PetDiaryCreatePage extends StatefulWidget {
  final String petId;

  const PetDiaryCreatePage({Key? key, required this.petId}) : super(key: key);

  @override
  _PetDiaryCreatePageState createState() => _PetDiaryCreatePageState();
}

class _PetDiaryCreatePageState extends State<PetDiaryCreatePage> {
QuillController _controller = QuillController.basic();
  bool isLoading = false;

  Future<void> _saveDiaryEntry() async {
    if (_controller.document.isEmpty()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('The content cannot be empty!')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      // Chuyển đổi nội dung thành HTML để lưu vào database
      String diaryContent = jsonEncode(_controller.document.toDelta().toJson());

      final response = await http.post(
        Uri.parse('http://192.168.1.4:5010/api/PetDiary'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({
          'pet_ID': widget.petId,
          'diary_Content': diaryContent, // Lưu HTML vào DB
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pet Diary Created Successfully!')),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create pet diary: ${response.body}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving diary entry')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create Pet Diary')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            QuillSimpleToolbar(
              controller: _controller,
              config: const QuillSimpleToolbarConfig(),
            ),
            Expanded(
              child: QuillEditor.basic(
                controller: _controller,
                config: const QuillEditorConfig(),
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : _saveDiaryEntry,
              child: isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Save'),
            ),
          ],
        ),
      ),
    );

    @override
      void dispose() {
        _controller.dispose();
        super.dispose();
      }
  }
}
