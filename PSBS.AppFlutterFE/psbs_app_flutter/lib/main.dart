import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/pages/booking_page.dart';
import 'package:psbs_app_flutter/pages/pet/pet_page.dart';
import 'package:psbs_app_flutter/pages/route_generator.dart';
import 'package:psbs_app_flutter/pages/voucher_page.dart';
import 'package:psbs_app_flutter/pages/room/room_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Additional pages from Tuan/AccountManagementFlutter
import 'pages/Account/editprofile_page.dart';
import 'pages/Account/profile_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'PetEase App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      initialRoute: '/login', // Default startup page
      onGenerateRoute: RouteGenerator.generateRoute,
    );
  }
}

class MyHomePage extends StatefulWidget {
  final String accountId;
  final int initialIndex;
  final String title;

  const MyHomePage({
    super.key,
    required this.title,
    required this.accountId,
    this.initialIndex = 0,
  });

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late String accountId;
  late int index;
  final navigationKey = GlobalKey<CurvedNavigationBarState>();

  final screens = [
    RoomPage(),
    PetPage(),
    BookingPage(),
    VoucherPage(),
    ProfilePage(accountId: '', title: ''),
    EditProfilePage(accountId: '', title: ''),
  ];

  @override
  void initState() {
    super.initState();
    index = widget.initialIndex;
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
      appBar: AppBar(
        backgroundColor: Colors.blue,
        title: Row(
          children: [
            Icon(Icons.pets, color: Colors.white, size: 30),
            const SizedBox(width: 5),
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
            icon: const Icon(Icons.messenger, color: Colors.white, size: 28),
            tooltip: 'Chat',
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.menu, color: Colors.white, size: 28),
            onSelected: (value) {
              if (value == 'logout') {
                logout(context); // Sửa lỗi: truyền context vào
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout, color: Colors.red),
                  title: Text('Logout', style: TextStyle(color: Colors.red)),
                ),
              ),
            ],
          ),
        ],
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
          iconTheme: IconThemeData(color: Colors.white),
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


  Future<void> logout(BuildContext context) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await prefs.remove('accountId'); 
  await prefs.remove('token'); 
  Navigator.pushReplacementNamed(context, "/login"); 
}
}
