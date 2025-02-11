import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/pages/Account/login_page.dart';
import 'package:psbs_app_flutter/pages/booking_page.dart';

import 'package:psbs_app_flutter/pages/home_page.dart';
import 'package:psbs_app_flutter/pages/pet_page.dart';
import 'package:psbs_app_flutter/pages/profile_page.dart';
import 'package:psbs_app_flutter/pages/voucher_page.dart';

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
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home:  EditProfilePage(accountId: 'd16f43b2-17cf-4a1e-8d9a-16fa813a13fb',),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int index = 0;
  final navigationKey = GlobalKey<CurvedNavigationBarState>();

  final screens = [
    HomePage(),
    PetPage(),
    BookingPage(),
    VoucherPage(),
    ProfilePages(),
  ];
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
