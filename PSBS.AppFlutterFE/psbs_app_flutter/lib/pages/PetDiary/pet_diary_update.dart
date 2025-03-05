import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;
import 'package:flutter_quill_extensions/flutter_quill_extensions.dart';
import 'package:http/http.dart' as http;
import 'package:vsc_quill_delta_to_html/vsc_quill_delta_to_html.dart';
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:html/parser.dart' as htmlParser;
import 'package:html/dom.dart' as dom;

class PetDiaryUpdatePage extends StatefulWidget {
  final Map<String, dynamic> diary;

  const PetDiaryUpdatePage({Key? key, required this.diary}) : super(key: key);

  @override
  _PetDiaryUpdatePageState createState() => _PetDiaryUpdatePageState();
}

class _PetDiaryUpdatePageState extends State<PetDiaryUpdatePage> {
  final ImagePicker _picker = ImagePicker();
  List<XFile>? _mediaFileList;
  quill.QuillController _controller = quill.QuillController.basic();
  bool isLoading = false;
  bool isFetching = true;

  @override
  void initState() {
    super.initState();
    print("Received diary: ${widget.diary}");
    _loadDiaryEntryFromData();
  }

  void _loadDiaryEntryFromData() async {
    String htmlContent = widget.diary['diary_Content'] ?? '';

    // Chuyển đổi HTML -> Delta JSON
    List<dynamic> deltaJson = await convertHtmlToDelta(htmlContent);
    quill.QuillController newController = quill.QuillController(
      document: quill.Document.fromJson(deltaJson),
      selection: const TextSelection.collapsed(offset: 0),
    );

    setState(() {
      _controller = newController;
      isFetching = false;
    });
  }

  /// 🔹 **Chuyển đổi HTML -> Delta JSON**
  Future<List<dynamic>> convertHtmlToDelta(String html) async {
    dom.Document document = htmlParser.parse(html);
    List<dynamic> deltaOps = [];

    for (var element in document.body!.nodes) {
      if (element is dom.Element) {
        if (element.localName == "p") {
          if (element.children.any((child) => child.localName == "img")) {
            for (var child in element.children) {
              if (child.localName == "img") {
                String? imageUrl = child.attributes['src'];
                if (imageUrl != null && imageUrl.startsWith("data:image")) {
                  deltaOps.add({
                    "insert": {"image": imageUrl}
                  }); // ✅ Embed ảnh đúng cách
                  deltaOps.add({"insert": "\n"}); // ✅ Xuống dòng sau ảnh
                }
              }
            }
          } else {
            deltaOps.add({"insert": "${element.text}\n"});
          }
        } else if (element.localName == "img") {
          String? imageUrl = element.attributes['src'];
          if (imageUrl != null && imageUrl.startsWith("data:image")) {
            deltaOps.add({
              "insert": {"image": imageUrl}
            }); // ✅ Chèn ảnh đúng cách
            deltaOps.add({"insert": "\n"});
          }
        } else {
          deltaOps.add({"insert": element.text});
        }
      } else if (element is dom.Text) {
        deltaOps.add({"insert": element.text});
      }
    }

    return deltaOps;
  }

  /// 🔹 **Chuyển đổi Delta JSON -> HTML**
  Future<String> convertDeltaToHtml(String deltaJsonString) async {
    List<dynamic> deltaJson = jsonDecode(deltaJsonString);
    List<Map<String, dynamic>> deltaList =
        List<Map<String, dynamic>>.from(deltaJson);

    for (var op in deltaList) {
      if (op.containsKey("insert") && op["insert"] is Map<String, dynamic>) {
        var insert = op["insert"];
        if (insert.containsKey("image")) {
          String imagePath = insert["image"];
          if (imagePath.startsWith("/data/") ||
              imagePath.startsWith("file://")) {
            File imageFile = File(imagePath);
            if (await imageFile.exists()) {
              List<int> imageBytes = await imageFile.readAsBytes();
              String base64Image = base64Encode(imageBytes);
              insert["image"] = "data:image/jpeg;base64,$base64Image";
            }
          }
        }
      }
    }

    final converter =
        QuillDeltaToHtmlConverter(deltaList, ConverterOptions.forEmail());
    return converter.convert();
  }

  /// 🔹 **Hàm cập nhật nhật ký thú cưng**
  Future<void> _updateDiaryEntry() async {
    if (_controller.document.isEmpty()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('The content cannot be empty!')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      String deltaJson = jsonEncode(_controller.document.toDelta().toJson());
      String diaryContent = await convertDeltaToHtml(deltaJson);

      final response = await http.put(
        Uri.parse(
            'http://10.10.11.54:5010/api/PetDiary/${widget.diary['diary_ID']}'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json.encode({'diary_Content': diaryContent}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pet Diary Updated Successfully!')),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to update pet diary: ${response.body}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating diary entry: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Update Pet Diary')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: isFetching
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  quill.QuillSimpleToolbar(
                    controller: _controller,
                    config: quill.QuillSimpleToolbarConfig(
                      embedButtons: FlutterQuillEmbeds.toolbarButtons(
                        cameraButtonOptions: QuillToolbarCameraButtonOptions(
                          afterButtonPressed: () async {
                            await _onImageButtonPressed(ImageSource.gallery,
                                context: context);
                          },
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: quill.QuillEditor.basic(
                      controller: _controller,
                      config: quill.QuillEditorConfig(
                          embedBuilders: FlutterQuillEmbeds.editorBuilders()),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: isLoading ? null : _updateDiaryEntry,
                    child: isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Update'),
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
