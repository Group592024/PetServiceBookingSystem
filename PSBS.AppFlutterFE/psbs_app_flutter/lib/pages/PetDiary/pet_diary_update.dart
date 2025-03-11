import 'dart:typed_data';

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
import 'package:image/image.dart' as img;

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
  FocusNode _editorFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    print("Received diary: ${widget.diary}");
    _loadDiaryEntryFromData();

    _controller.document.changes.listen((event) {
      if (mounted) {
        // Không gọi setState() trừ khi thực sự cần thiết
        setState(() {}); // Chỉ cập nhật phần văn bản, không re-render ảnh
        _editorFocusNode.requestFocus();
      }
    });
  }

  void _loadDiaryEntryFromData() async {
    String htmlContent = widget.diary['diary_Content'] ?? '';

    final cursorPosition = _controller.selection;

    // Chuyển đổi HTML -> Delta JSON
    List<dynamic> deltaJson = await convertHtmlToDelta(htmlContent);
    setState(() {
      _controller.document = quill.Document.fromJson(deltaJson);
      _controller.updateSelection(cursorPosition, quill.ChangeSource.local);
      isFetching = false;
    });
  }

  Future<List<dynamic>> convertHtmlToDelta(String html) async {
    dom.Document document = htmlParser.parse(html);
    List<dynamic> deltaOps = [];

    for (var element in document.body!.nodes) {
      if (element is dom.Element) {
        if (element.localName == "p") {
          for (var child in element.nodes) {
            if (child is dom.Text) {
              String text = child.text.trim();
              if (text.isNotEmpty) {
                deltaOps.add({"insert": "$text\n"});
              }
            } else if (child is dom.Element) {
              deltaOps.addAll(_parseElement(child));
            }
          }
        } else {
          deltaOps.addAll(_parseElement(element));
        }
      } else if (element is dom.Text) {
        deltaOps.add({"insert": element.text});
      }
    }

    return deltaOps;
  }

// Hàm xử lý từng thẻ HTML để bảo toàn format
  List<Map<String, dynamic>> _parseElement(dom.Element element) {
    List<Map<String, dynamic>> ops = [];
    String text = element.text.trim();

    if (text.isNotEmpty) {
      Map<String, dynamic> attributes = {};

      // Kiểm tra kiểu định dạng
      if (element.localName == "b" || element.localName == "strong") {
        attributes["bold"] = true;
      }
      if (element.localName == "i" || element.localName == "em") {
        attributes["italic"] = true;
      }
      if (element.localName == "u") {
        attributes["underline"] = true;
      }
      if (element.localName == "s" || element.localName == "del") {
        attributes["strike"] = true;
      }
      if (element.localName == "sup") {
        attributes["script"] = "super";
      }
      if (element.localName == "sub") {
        attributes["script"] = "sub";
      }

      // Kiểm tra heading
      if (element.localName == "h1") {
        attributes["header"] = 1;
      } else if (element.localName == "h2") {
        attributes["header"] = 2;
      } else if (element.localName == "h3") {
        attributes["header"] = 3;
      }

      // Kiểm tra blockquote
      if (element.localName == "blockquote") {
        attributes["blockquote"] = true;
      }

      // Kiểm tra code block
      if (element.localName == "code") {
        attributes["code"] = true;
      }

      // Kiểm tra danh sách (ul/ol)
      if (element.localName == "li") {
        dom.Element? parent = element.parent;
        if (parent != null) {
          if (parent.localName == "ul") {
            attributes["list"] = "bullet";
          } else if (parent.localName == "ol") {
            attributes["list"] = "ordered";
          }
        }
      }

      // Kiểm tra link
      if (element.localName == "a") {
        String? href = element.attributes['href'];
        if (href != null && href.isNotEmpty) {
          attributes["link"] = href;
        }
      }

      // Kiểm tra căn chỉnh (text-align)
      String? style = element.attributes['style'];
      if (style != null) {
        if (style.contains("text-align: center")) {
          attributes["align"] = "center";
        } else if (style.contains("text-align: right")) {
          attributes["align"] = "right";
        }
      }

      // Nếu có định dạng, thêm vào Delta JSON
      if (attributes.isNotEmpty) {
        ops.add({"insert": text, "attributes": attributes});
      } else {
        ops.add({"insert": text});
      }
    }

    // Xử lý hình ảnh
    if (element.localName == "img") {
      String? imageUrl = element.attributes['src'];
      if (imageUrl != null && imageUrl.startsWith("data:image")) {
        ops.add({
          "insert": {"image": imageUrl}
        });
        ops.add({"insert": "\n"});
      }
    }

    return ops;
  }

  Future<String> compressAndEncodeBase64(List<int> imageBytes) async {
    img.Image image = img.decodeImage(Uint8List.fromList(imageBytes))!;

    img.Image resizedImage = img.copyResize(image, width: 600);

    List<int> compressedBytes = img.encodeJpg(resizedImage, quality: 60);

    return base64Encode(compressedBytes);
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

          // 🔹 Nếu là ảnh cục bộ thì chuyển sang base64
          if (imagePath.startsWith("/data/") ||
              imagePath.startsWith("file://")) {
            File imageFile = File(imagePath);
            if (await imageFile.exists()) {
              List<int> imageBytes = await imageFile.readAsBytes();

              // 🔹 Nén ảnh trước khi encode base64
              String base64Image = await compressAndEncodeBase64(imageBytes);

              insert["image"] = "data:image/jpeg;base64,$base64Image";
            }
          }
        }
      }
    }

    // 🔹 Chuyển đổi Delta sang HTML
    final converter = QuillDeltaToHtmlConverter(
      deltaList,
      ConverterOptions.forEmail(),
    );

    String html = converter.convert();

// sua nhe
    html = html.replaceAllMapped(
      RegExp(r'(<img)([^>]*)(>)'),
      (match) =>
          '${match.group(1)}${match.group(2)} style="display: block; margin-bottom: 10px;"${match.group(3)}',
    );

    return html;
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

      print("Updated diary content: $diaryContent");

      final response = await http.put(
        Uri.parse(
            'http://10.66.187.111:5010/api/PetDiary/${widget.diary['diary_ID']}'),
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
        Navigator.of(context).pop(true);
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
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: isFetching
                ? const Center(child: CircularProgressIndicator())
                : Column(
                    children: [
                      quill.QuillSimpleToolbar(
                        controller: _controller,
                        config: quill.QuillSimpleToolbarConfig(
                          embedButtons: FlutterQuillEmbeds.toolbarButtons(
                            cameraButtonOptions:
                                QuillToolbarCameraButtonOptions(
                              afterButtonPressed: () async {
                                await _onImageButtonPressed(ImageSource.gallery,
                                    context: context);
                              },
                            ),
                          ),
                        ),
                      ),
                      Container(
                        height: 400,
                        child: quill.QuillEditor.basic(
                          controller: _controller,
                          config: quill.QuillEditorConfig(
                            embedBuilders: FlutterQuillEmbeds
                                .editorBuilders(), // Giữ nguyên ảnh
                          ),
                          focusNode: _editorFocusNode,
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: isLoading ? null : _updateDiaryEntry,
                        child: isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white)
                            : const Text('Update'),
                      ),
                    ],
                  ),
          ),
        ));
  }

  @override
  void dispose() {
    _editorFocusNode.dispose();
    _controller.dispose();
    super.dispose();
  }
}

typedef OnPickImageCallback = void Function();
