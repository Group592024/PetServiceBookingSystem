import 'dart:io';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

// Custom HttpOverrides to bypass SSL certificate verification in development
class DevHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

class VNPayWebView extends StatefulWidget {
  final String url;

  const VNPayWebView({Key? key, required this.url}) : super(key: key);

  @override
  _VNPayWebViewState createState() => _VNPayWebViewState();
}

class _VNPayWebViewState extends State<VNPayWebView> {
  late WebViewController _controller;
  bool _isLoading = true;
  String _currentUrl = '';

  @override
  void initState() {
    super.initState();
    
    // Apply certificate bypass for development
    HttpOverrides.global = DevHttpOverrides();
    
    // Try to open in external browser one more time
    _tryExternalBrowser();
  }
  
  Future<void> _tryExternalBrowser() async {
    try {
      final uri = Uri.parse(widget.url);
      if (await canLaunchUrl(uri)) {
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
        
        if (launched) {
          // If successfully launched, close this screen
          if (mounted) {
            Future.delayed(Duration(seconds: 1), () {
              Navigator.of(context).pop();
            });
          }
          return;
        }
      }
    } catch (e) {
      print('[ERROR] Failed to open URL in external browser: $e');
    }
    
    // If external browser fails, initialize WebView
    _initializeWebView();
  }
  
  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _currentUrl = url;
              });
            }
            print('[DEBUG] WebView loading: $url');
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
            print('[DEBUG] WebView finished loading: $url');
          },
          onNavigationRequest: (NavigationRequest request) {
            print('[DEBUG] WebView navigation request: ${request.url}');
            
            // Check if this is the callback URL
            if (request.url.contains('/Vnpay/Callback') || 
                request.url.contains('vnp_ResponseCode=')) {
              _handlePaymentCallback(request.url);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            print('[ERROR] WebView error: ${error.description} (${error.errorCode})');
            
            if (mounted && _isLoading) {
              setState(() {
                _isLoading = false;
              });
              
              // Show error message for critical errors
              if (error.errorCode == -1 || error.description.contains('ERR_CERT_')) {
                _showErrorDialog('Connection Error', 
                  'Unable to connect to the payment gateway. Please try again later.');
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  void _handlePaymentCallback(String url) async {
    print('[DEBUG] Handling payment callback: $url');
    
    // Parse URL parameters
    final uri = Uri.parse(url);
    final queryParams = uri.queryParameters;
    
    // Check payment status from query parameters
    final responseCode = queryParams['vnp_ResponseCode'] ?? 
                         queryParams['status'] ?? 'failed';
    
    String message;
    bool success = false;
    
    // VNPay response code '00' means success
    if (responseCode == '00' || responseCode == 'success') {
      message = 'Payment successful! Your booking has been confirmed.';
      success = true;
    } else {
      message = 'Payment failed or was cancelled. Please try again or choose another payment method.';
    }
    
    if (mounted) {
      await _showResultDialog(success, message);
    }
  }
  
  Future<void> _showResultDialog(bool success, String message) async {
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(success ? 'Payment Successful' : 'Payment Failed'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Return to previous screen
              
              // If successful, also pop the booking screen to go back to the list
              if (success) {
                Navigator.of(context).pop();
              }
            },
            child: Text('OK'),
          ),
        ],
      ),
    );
  }
  
  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Return to previous screen
            },
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('VNPay Payment'),
        actions: [
          IconButton(
            icon: Icon(Icons.open_in_browser),
            onPressed: _tryExternalBrowser,
          ),
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: () {
              if (_controller != null) {
                _controller.reload();
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading payment page...'),
                  SizedBox(height: 8),
                  Text(
                    'Please wait, this may take a moment',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
