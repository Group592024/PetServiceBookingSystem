import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/main.dart';
import 'package:psbs_app_flutter/pages/Account/changepassword_page.dart';
import 'package:psbs_app_flutter/pages/home_page.dart';
import 'package:psbs_app_flutter/pages/pet/pet_page.dart';
import 'package:psbs_app_flutter/pages/booking_page.dart';
import 'package:psbs_app_flutter/pages/voucher_page.dart';
import 'package:psbs_app_flutter/pages/Account/profile_page.dart';
import 'package:psbs_app_flutter/pages/Account/login_page.dart';
import 'package:psbs_app_flutter/pages/Account/register_page.dart';
import 'package:psbs_app_flutter/pages/Account/forgotpassword_page.dart';
import 'package:psbs_app_flutter/pages/Account/editprofile_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RouteGenerator {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    final args = settings.arguments;

    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const HomePage());
      case '/home':
        return MaterialPageRoute(builder: (_) => const MyHomePage(title: '', accountId: '',));
      case '/pet':
        return MaterialPageRoute(builder: (_) => const PetPage());
      case '/booking':
        return MaterialPageRoute(builder: (_) => const BookingPage());
      case '/voucher':
        return MaterialPageRoute(builder: (_) => const VoucherPage());
      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfilePage(accountId: '', title: '',));
      case '/login':
        return MaterialPageRoute(builder: (_) => LoginPage());
      case '/register':
        return MaterialPageRoute(builder: (_) =>  RegisterPage());
      case '/forgotpassword':
        return MaterialPageRoute(builder: (_) =>  ForgotPasswordPage());
      case '/editprofile':
        return MaterialPageRoute(builder: (_) => const EditProfilePage(accountId: '', title: '',));
       case '/changepassword':
         return MaterialPageRoute(builder: (_) => ChangePasswordPage(title: '',accountId: '',));
      default:
        return _errorRoute();
    }
  }

  static Route<dynamic> _errorRoute() {
    return MaterialPageRoute(
      builder: (_) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('Page not found')),
      ),
    );
  }
}
