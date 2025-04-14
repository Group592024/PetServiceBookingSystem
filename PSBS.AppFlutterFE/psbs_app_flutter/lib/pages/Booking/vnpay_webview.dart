import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

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
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _currentUrl = url;
            });
            print('[DEBUG] WebView loading: $url');
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            print('[DEBUG] WebView finished loading: $url');
          },
          onNavigationRequest: (NavigationRequest request) {
            print('[DEBUG] WebView navigation request: ${request.url}');
            
            // Check if this is the callback URL
            if (request.url.contains('/Vnpay/Callback')) {
              _handlePaymentCallback(request.url);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            print('[ERROR] WebView error: ${error.description}');
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
    final status = queryParams['status'] ?? 'failed';
    
    String message;
    bool success = false;
    
    if (status == 'success') {
      message = 'Payment successful! Your booking has been confirmed.';
      success = true;
    } else if (status == 'failed') {
      message = 'Payment failed. Please try again or choose another payment method.';
    } else {
      message = 'Payment process interrupted. Please check your booking status.';
    }
    
    if (mounted) {
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: Text(success ? 'Payment Successful' : 'Payment Failed'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('VNPay Payment'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: () => _controller.reload(),
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
                ],
              ),
            ),
        ],
      ),
    );
  }
}
