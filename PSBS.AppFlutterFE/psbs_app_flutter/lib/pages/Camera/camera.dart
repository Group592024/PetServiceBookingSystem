// import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;
// import 'dart:convert';

// import 'hls_player.dart';

// class CameraScreen extends StatefulWidget {
//   @override
//   _CameraScreenState createState() => _CameraScreenState();
// }

// class _CameraScreenState extends State<CameraScreen> {
//   TextEditingController _cameraCodeController = TextEditingController();
//   String? _streamUrl;
//   bool _isLoading = false;
//   String? _error;

//   Future<void> fetchCameraStream() async {
//     if (_cameraCodeController.text.isEmpty) {
//       setState(() {
//         _error = 'Vui lòng nhập mã camera';
//       });
//       return;
//     }

//     setState(() {
//       _isLoading = true;
//       _error = null;
//       _streamUrl = null;
//     });

//     try {
//       final response = await http.get(
//         Uri.parse(
//           'http://10.0.2.2:5023/api/Camera/stream/${_cameraCodeController.text}?_=${DateTime.now().millisecondsSinceEpoch}',
//         ),
//       );

//       if (response.statusCode != 200) {
//         throw Exception(
//             jsonDecode(response.body)['message'] ?? 'Lỗi không xác định');
//       }

//       final data = jsonDecode(response.body);
//       if (data['streamUrl'] != null) {
//         setState(() {
//           _streamUrl =
//               "${data['streamUrl']}?t=${DateTime.now().millisecondsSinceEpoch}";
//           _error = null;
//         });
//       } else {
//         throw Exception('Không tìm thấy luồng video');
//       }
//     } catch (e) {
//       setState(() {
//         _error = e.toString();
//       });
//     } finally {
//       setState(() {
//         _isLoading = false;
//       });
//     }
//   }

//   @override
//   void dispose() {
//     _cameraCodeController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: const Text('📹 Camera')),
//       body: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           children: [
//             TextField(
//               controller: _cameraCodeController,
//               decoration: InputDecoration(
//                 hintText: 'Nhập mã camera...',
//                 border: OutlineInputBorder(
//                   borderRadius: BorderRadius.circular(12.0),
//                 ),
//                 suffixIcon: IconButton(
//                   icon: Icon(Icons.search),
//                   onPressed: fetchCameraStream,
//                 ),
//               ),
//             ),
//             const SizedBox(height: 16),
//             if (_isLoading)
//               const Row(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   CircularProgressIndicator(),
//                   SizedBox(width: 10),
//                   Text('Đang tải...'),
//                 ],
//               ),
//             if (_error != null)
//               Container(
//                 padding: const EdgeInsets.all(12),
//                 margin: const EdgeInsets.only(top: 10),
//                 decoration: BoxDecoration(
//                   color: Colors.red.shade100,
//                   borderRadius: BorderRadius.circular(8),
//                 ),
//                 child: Row(
//                   children: [
//                     Icon(Icons.error, color: Colors.red),
//                     const SizedBox(width: 8),
//                     Expanded(
//                         child:
//                             Text(_error!, style: TextStyle(color: Colors.red))),
//                   ],
//                 ),
//               ),
//             if (_streamUrl != null)
//               Expanded(
//                 child: Padding(
//                   padding: const EdgeInsets.only(top: 16.0),
//                   child: HLSPlayer(streamUrl: _streamUrl!),
//                 ),
//               ),
//           ],
//         ),
//       ),
//     );
//   }
// }
