import 'package:flutter/material.dart';
import 'package:animations/animations.dart';
import 'package:flutter_swiper_plus/flutter_swiper_plus.dart';

class AllService extends StatelessWidget {
  // Updated price format to be more compact
  final List<Map<String, String>> services = [
    {
      'title': 'Pet Grooming',
      'image': 'assets/HomePage/services/grooming.png',
      'content': 'Professional grooming services for your pet.',
      'price': '150K₫+',
      'fullPrice': 'From 150.000₫ / package'
    },
    {
      'title': 'Health & Wellness',
      'image': 'assets/HomePage/services/veterinary.png',
      'content': "Routine vet checkups to ensure your pet's health.",
      'price': '200K₫+',
      'fullPrice': 'From 200.000₫ / visit'
    },
    {
      'title': 'Pet Hotel',
      'image': 'assets/HomePage/services/pet-hotel.png',
      'content': 'Daily care for your pet while you are away.',
      'price': '120K₫+',
      'fullPrice': 'From 120.000₫ / night'
    },
    {
      'title': 'Walking & Sitting',
      'image': 'assets/HomePage/services/dog-walking.png',
      'content': 'Daily pet walking service to keep your pet active.',
      'price': '50K₫+',
      'fullPrice': 'From 50.000₫ / hour'
    },
    {
      'title': 'Pet Training',
      'image': 'assets/HomePage/services/training.png',
      'content': 'Behavioral training for your pet by experts.',
      'price': '180K₫+',
      'fullPrice': 'From 180.000₫ / session'
    },
    {
      'title': 'Pet Taxi',
      'image': 'assets/HomePage/services/pet-taxi.png',
      'content': 'Safe and comfortable boarding services for your pet.',
      'price': '100K₫+',
      'fullPrice': 'From 100.000₫ / trip'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color.fromARGB(249, 255, 254, 254), Color(0xFFB3E5FC)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'Our Pet Ease Services',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2aa6df),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 0.65, // Adjusted for better content fit
            ),
            itemCount: services.length,
            itemBuilder: (context, index) {
              final service = services[index];
              return OpenContainer(
                closedElevation: 0,
                closedShape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                transitionDuration: const Duration(milliseconds: 500),
                closedBuilder: (context, openContainer) => GestureDetector(
                  onTap: openContainer,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Top section with image
                        Image.asset(service['image']!, height: 60),

                        // Title section
                        Text(
                          service['title']!,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                        ),

                        // Content section
                        Text(
                          service['content']!,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.black54,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),

                        // Price badge - compact format
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.amber.shade200),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.monetization_on,
                                  size: 14, color: Colors.amber[700]),
                              const SizedBox(width: 4),
                              Text(
                                service['price']!,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.amber[700],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Button section
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              if (service['title'] == 'Pet Hotel') {
                                Navigator.of(context).pushNamed('/room');
                              } else {
                                Navigator.of(context).pushNamed('/services');
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                            ),
                            child: Text(
                              service['title'] == 'Pet Hotel'
                                  ? "View Rooms"
                                  : "Get Service",
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                openBuilder: (context, closeContainer) =>
                    ServiceDetailScreen(service: service),
              );
            },
          ),
        ],
      ),
    );
  }
}

class ServiceDetailScreen extends StatelessWidget {
  final Map<String, String> service;
  const ServiceDetailScreen({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(service['title']!,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF2aa6df),
        foregroundColor: Colors.white,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE3F2FD), Colors.white],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(service['image']!, height: 140),
                const SizedBox(height: 20),
                Text(
                  service['title']!,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2aa6df),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  service['content']!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    // Use the full price format in the detail screen
                    service['fullPrice'] ?? service['price']!,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                ),
                const SizedBox(height: 25),
                ElevatedButton(
                  onPressed: () {
                    // Fixed navigation logic for both service types
                    if (service['title'] == 'Pet Hotel') {
                      Navigator.of(context).pushNamed('/room');
                    } else {
                      Navigator.of(context).pushNamed('/services');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF2aa6df),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 30, vertical: 12),
                  ),
                  child: Text(
                    service['title'] == 'Pet Hotel'
                        ? "View Rooms"
                        : "Get Service",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
