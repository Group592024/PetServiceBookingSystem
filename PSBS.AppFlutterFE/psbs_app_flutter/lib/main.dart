import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/pages/Account/login_page.dart';
import 'package:psbs_app_flutter/pages/booking_page.dart';

import 'package:psbs_app_flutter/pages/home_page.dart';
import 'package:psbs_app_flutter/pages/pet_page.dart';
import 'package:psbs_app_flutter/pages/profile_page.dart';
import 'package:psbs_app_flutter/pages/route_generator.dart';
import 'package:psbs_app_flutter/pages/voucher_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'pages/Account/editprofile_page.dart';
import 'pages/Account/forgotpassword_page.dart';
import 'pages/Account/profile_page.dart';
import 'pages/Account/register_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'PetEase App',
      theme: ThemeData(
        
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      initialRoute: '/login', // Trang khởi động
      onGenerateRoute: RouteGenerator.generateRoute,
    );
  }
}

class MyHomePage extends StatefulWidget {
  final String accountId;
  
  final dynamic title;
  const MyHomePage({super.key, required this.title, required this.accountId});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}
class _MyHomePageState extends State<MyHomePage> {
  late String accountId;
  int index = 0;
  final navigationKey = GlobalKey<CurvedNavigationBarState>();
  final screens = [
    HomePage(),
    PetPage(),
    BookingPage(),
    VoucherPage(),
    ProfilePage(accountId: '', title: '',),
    EditProfilePage(accountId: '', title: '',),
  ];
  @override
  void initState() {
    super.initState();
    _loadAccountId(); 
  }

  Future<void> _loadAccountId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      accountId = widget.accountId.isNotEmpty
          ? widget.accountId
          : (prefs.getString('accountId') ?? ''); 
    });
  }
  @override
  Widget build(BuildContext context) {
    final items = <Widget>[
      Icon(Icons.home, size: 30),
      Icon(Icons.pets_rounded, size: 30),
      Icon(Icons.add, size: 30),
      Icon(Icons.local_offer, size: 30),
      Icon(Icons.person, size: 30),
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.blue,
        title: Row(
          children: [
            // Add an icon
            Icon(
              Icons.pets,
              color: Colors.white,
              size: 30,
            ),
            const SizedBox(width: 1), // Spacing between icon and text
            // Create styled text
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: 'Pet',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 30,
                    ),
                  ),
                  TextSpan(
                    text: 'Ease',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 30,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: <Widget>[
          // Chat action
          IconButton(
            onPressed: () {
              // Add your onPressed logic here
            },
            icon: const Icon(
              Icons.messenger,
              color: Colors.white,
              size: 28,
            ),
            tooltip: 'Chat',
          ),
          // Menu action
          IconButton(
            onPressed: () {
              // Add your onPressed logic here
            },
            icon: const Icon(
              Icons.menu,
              color: Colors.white,
              size: 28,
            ),
            tooltip: 'Menu',
          ),
        ],
      ),
      bottomNavigationBar: Theme(
          data: Theme.of(context)
              .copyWith(iconTheme: IconThemeData(color: Colors.white)),
          child: CurvedNavigationBar(
            key: navigationKey,
            color: Colors.blue,
            buttonBackgroundColor: Colors.blue,
            items: items,
            index: index,
            onTap: (selectedIndex) {
              setState(() {
                index = selectedIndex;
              });
            },
            height: 70,
            animationCurve: Curves.easeIn,
            backgroundColor: Colors.transparent,
          )),
      body: screens[index],
    );
  }
}
