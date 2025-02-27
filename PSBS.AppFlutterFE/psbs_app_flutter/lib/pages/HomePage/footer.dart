import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF48CAE4), Color(0xFFE0F7FA)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo and Contact Section
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Color(0xFF90E0EF),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.pets, size: 30, color: Colors.blue),
                    SizedBox(width: 8),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: "Pet",
                            style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black),
                          ),
                          TextSpan(
                            text: "Ease",
                            style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                Text(
                  "Contact us via phone, email, or by visiting our store. We value your feedback and are committed to excellent service.",
                  style: TextStyle(fontSize: 14),
                ),
                SizedBox(height: 10),
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.phone, size: 32, color: Colors.black),
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("+123456789",
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold)),
                          Text("Got Questions? Call us 24/7",
                              style: TextStyle(fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fade(duration: 500.ms).slideY(begin: 0.2),

          SizedBox(height: 20),

          // Links & Working Hours in the same row
          LayoutBuilder(
            builder: (context, constraints) {
              return constraints.maxWidth > 600
                  ? Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        FooterSection(
                          title: "Useful Links",
                          items: [
                            "Home",
                            "About",
                            "Service",
                            "Room",
                            "Contact",
                            "Support"
                          ],
                        ),
                        SizedBox(width: 40),
                        WorkingHoursSection(),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FooterSection(
                          title: "Useful Links",
                          items: [
                            "Home",
                            "About",
                            "Service",
                            "Room",
                            "Contact",
                            "Support"
                          ],
                        ),
                        SizedBox(height: 20),
                        WorkingHoursSection(),
                      ],
                    );
            },
          ),

          SizedBox(height: 20),

          // Book Service
          FooterSection(
              title: "Book Service", items: ["Get Started"], isLink: true),
        ],
      ),
    );
  }
}

// Footer Section for general lists
class FooterSection extends StatelessWidget {
  final String title;
  final List<String> items;
  final bool isLink;

  FooterSection(
      {required this.title, required this.items, this.isLink = false});

  @override
  Widget build(BuildContext context) {
    // Chia danh sách thành 2 cột
    List<List<String>> splitItems = [
      items.sublist(0, (items.length / 2).ceil()),
      items.sublist((items.length / 2).ceil())
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 10),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: splitItems.map((columnItems) {
            return Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: columnItems.map((item) {
                  bool isGetStarted = item == "Get Started";
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        if (!isGetStarted) ...[
                          Icon(Icons.circle, size: 6, color: Colors.black),
                          SizedBox(width: 6),
                        ],
                        GestureDetector(
                          onTap: () {},
                          child: Row(
                            children: [
                              Text(
                                item,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color:
                                      isGetStarted ? Colors.blue : Colors.black,
                                ),
                              ),
                              if (isGetStarted)
                                Icon(Icons.arrow_forward,
                                    size: 16, color: Colors.blue),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            );
          }).toList(),
        ),
      ],
    ).animate().fade(duration: 600.ms).slideY(begin: 0.2);
  }
}

// Working Hours Section with styled text
class WorkingHoursSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Working Hours",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 10),
        _buildWorkingHour("Mon - Fri:", "9:00 AM - 6:00 PM"),
        _buildWorkingHour("Saturday:", "10:00 AM - 4:00 PM"),
        _buildWorkingHour("Sunday:", "Closed", isClosed: true),
      ],
    ).animate().fade(duration: 600.ms).slideY(begin: 0.2);
  }

  Widget _buildWorkingHour(String day, String time, {bool isClosed = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(day,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.black)),
          SizedBox(width: 8),
          RichText(
            text: TextSpan(
              style: TextStyle(
                  fontSize: 14, color: Colors.black), // Mặc định màu đen
              children: [
                TextSpan(
                  text: time,
                  style: TextStyle(
                    color: isClosed ? Colors.red : Colors.black,
                    fontWeight: isClosed
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
