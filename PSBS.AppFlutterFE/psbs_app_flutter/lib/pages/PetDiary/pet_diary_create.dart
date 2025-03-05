import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:flutter_quill_extensions/flutter_quill_extensions.dart';
import 'package:http/http.dart' as http;
import 'package:vsc_quill_delta_to_html/vsc_quill_delta_to_html.dart';
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class PetDiaryCreatePage extends StatefulWidget {
  final String petId;

  const PetDiaryCreatePage({Key? key, required this.petId}) : super(key: key);

  @override
  _PetDiaryCreatePageState createState() => _PetDiaryCreatePageState();
}

class _PetDiaryCreatePageState extends State<PetDiaryCreatePage> {
  final ImagePicker _picker = ImagePicker();
  List<XFile>? _mediaFileList;

  void _setImageFileListFromFile(XFile? value) {
    _mediaFileList = value == null ? null : <XFile>[value];
  }

  QuillController _controller = QuillController.basic();
  bool isLoading = false;

  Future<void> _saveDiaryEntry() async {
    print(_mediaFileList);

    if (_controller.document.isEmpty()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('The content cannot be empty!')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      String deltaJson = jsonEncode(_controller.document.toDelta().toJson());

      String diaryContent = await convertDeltaToHtml(deltaJson);

      final response = await http.post(
        Uri.parse('http://10.10.11.54:5010/api/PetDiary'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({
          'pet_ID': widget.petId,
          'diary_Content': diaryContent,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pet Diary Created Successfully!')),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to create pet diary: ${response.body}')),
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

  Future<void> _displayPickImageDialog(
      BuildContext context, bool isMulti, OnPickImageCallback onPick) async {
    return showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Add optional parameters'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
            ),
            actions: <Widget>[
              TextButton(
                child: const Text('CANCEL'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
              TextButton(
                  child: const Text('PICK'),
                  onPressed: () {
                    onPick();
                    Navigator.of(context).pop();
                  }),
            ],
          );
        });
  }

  Future<void> _onImageButtonPressed(
    ImageSource source, {
    required BuildContext context,
    bool isMultiImage = false,
  }) async {
    if (!context.mounted) return;

    if (context.mounted) {
      await _displayPickImageDialog(context, true, () async {
        try {
          final List<XFile> pickedFileList = await _picker.pickMultiImage();

          setState(() {
            _mediaFileList = pickedFileList;
          });
        } catch (e) {
          print(e);
        }
      });
    }
  }

  Future<String> convertDeltaToHtml(String deltaJsonString) async {
    List<dynamic> deltaJson = jsonDecode(deltaJsonString);
    List<Map<String, dynamic>> deltaList =
        List<Map<String, dynamic>>.from(deltaJson);

    for (var op in deltaList) {
      if (op.containsKey("insert") && op["insert"] is Map<String, dynamic>) {
        var insert = op["insert"];
        if (insert.containsKey("image")) {
          String imagePath = insert["image"];

          // Chuyển ảnh sang base64 nếu là đường dẫn cục bộ
          if (imagePath.startsWith("/data/") ||
              imagePath.startsWith("file://")) {
            File imageFile = File(imagePath);
            if (await imageFile.exists()) {
              List<int> imageBytes = await imageFile.readAsBytes();
              String base64Image = base64Encode(imageBytes);
              insert["image"] =
                  "data:image/jpeg;base64,$base64Image"; // Base64 format
            }
          }
        }
      }
    }

    final converter =
        QuillDeltaToHtmlConverter(deltaList, ConverterOptions.forEmail());
    return converter.convert();
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
              config: QuillSimpleToolbarConfig(
                embedButtons: FlutterQuillEmbeds.toolbarButtons(
                    cameraButtonOptions: QuillToolbarCameraButtonOptions(
                        afterButtonPressed: () async {
                  await _onImageButtonPressed(ImageSource.gallery,
                      context: context);
                })),
              ),
            ),
            Expanded(
              child: QuillEditor.basic(
                controller: _controller,
                config: QuillEditorConfig(
                    embedBuilders: FlutterQuillEmbeds.editorBuilders()),
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
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

typedef OnPickImageCallback = void Function();
