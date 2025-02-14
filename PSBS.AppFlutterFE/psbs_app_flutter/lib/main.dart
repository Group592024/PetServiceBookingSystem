import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/pages/booking_page.dart';

// import 'package:psbs_app_flutter/pages/home_page.dart';
import 'package:psbs_app_flutter/pages/pet/pet_page.dart';
import 'package:psbs_app_flutter/pages/profile_page.dart';
import 'package:psbs_app_flutter/pages/voucher_page.dart';
import 'package:psbs_app_flutter/pages/room/room_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: '/',
      routes: {
        '/booking': (context) => BookingPage(),
      },
      debugShowCheckedModeBanner: false,
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  final int initialIndex;
  final String title;

  MyHomePage({
    super.key,
    required this.title,
    this.initialIndex = 0,
  });

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late int index;
  final navigationKey = GlobalKey<CurvedNavigationBarState>();

  @override
  void initState() {
    super.initState();
    index = widget.initialIndex;
  }

  final screens = [
    RoomPage(),
    PetPage(),
    BookingPage(),
    VoucherPage(),
    ProfilePage(),
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
            Icon(
              Icons.pets,
              color: Colors.white,
              size: 30,
            ),
            const SizedBox(width: 1),
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
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.messenger,
              color: Colors.white,
              size: 28,
            ),
            tooltip: 'Chat',
          ),
          IconButton(
            onPressed: () {},
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
        data: Theme.of(context).copyWith(
          iconTheme: IconThemeData(color: Colors.white)
        ),
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
          animationCurve: Curves.easeInOut,
          backgroundColor: Colors.transparent,
        ),
      ),
      body: screens[index],
    );
  }
}
