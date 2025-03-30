import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/pages/Services/service_detail.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ServicePage extends StatefulWidget {
  const ServicePage({super.key});

  @override
  _ServicePageState createState() => _ServicePageState();
}

class _ServicePageState extends State<ServicePage> {
  List<dynamic> services = [];
  bool isLoading = true;
  bool isGridView = true;

  Future<void> fetchServices() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final responseServices = await http.get(
        Uri.parse('http://192.168.1.6:5050/api/Service?showAll=false'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
      );
      if (responseServices.statusCode == 200) {
        final dataServices = json.decode(responseServices.body);
        setState(() {
          services = dataServices['data'];
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load services');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      print('Error fetching data: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    fetchServices();
  }

  Widget buildServiceCard(Map<String, dynamic> service) {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  ServiceDetail(serviceId: service['serviceId'].toString()),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                // Service Image with Rounded Corners
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                  child: service['serviceImage'] != null
                      ? Image.network(
                          'http://192.168.1.6:5023${service['serviceImage']}',
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          height: 200,
                          color: Colors.grey[300],
                          child: Center(
                            child: Text('No Image',
                                style: TextStyle(fontSize: 16)),
                          ),
                        ),
                ),
                // Gradient Overlay
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withOpacity(0.5),
                          Colors.transparent
                        ],
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service['serviceName'] ?? 'No Name',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Type: ${service['serviceType']?['typeName'] ?? 'Unknown'}',
                    style: TextStyle(
                      fontSize: 15,
                      fontStyle: FontStyle.italic,
                      color: Colors.grey[700],
                    ),
                  ),
                  SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding:
                            EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                      ),
                      icon: Icon(Icons.arrow_forward_ios, size: 18),
                      label: Text(
                        "See More",
                        style: TextStyle(color: Colors.white),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ServiceDetail(
                                serviceId: service['serviceId'].toString()),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildServiceListItem(Map<String, dynamic> service) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  ServiceDetail(serviceId: service['serviceId'].toString()),
            ),
          );
        },
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
          child: Row(
            children: [
              // Service Image with Rounded Corners and Gradient
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: service['serviceImage'] != null
                    ? Stack(
                        children: [
                          Image.network(
                            'http://192.168.1.6:5023${service['serviceImage']}',
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                          ),
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.black.withOpacity(0.2),
                                  Colors.transparent
                                ],
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                              ),
                            ),
                          ),
                        ],
                      )
                    : Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey[300],
                        child: Center(
                          child:
                              Text('No Image', style: TextStyle(fontSize: 12)),
                        ),
                      ),
              ),
              SizedBox(width: 12),
              // Service Name & Type
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service['serviceName'] ?? 'No Name',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Type: ${service['serviceType']?['typeName'] ?? 'Unknown'}',
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                  ],
                ),
              ),
              // Animated "See More" Button
              IconButton(
                icon: Icon(Icons.arrow_forward_ios, color: Colors.blueAccent),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ServiceDetail(
                          serviceId: service['serviceId'].toString()),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Services For Your Pets'),
        actions: [
          IconButton(
            icon: Icon(isGridView ? Icons.list : Icons.grid_view),
            onPressed: () {
              setState(() {
                isGridView = !isGridView;
              });
            },
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : services.isEmpty
              ? Center(child: Text('No services available'))
              : RefreshIndicator(
                  onRefresh: fetchServices,
                  child: isGridView
                      ? ListView.builder(
                          itemCount: services.length,
                          itemBuilder: (context, index) =>
                              buildServiceCard(services[index]),
                        )
                      : ListView.builder(
                          itemCount: services.length,
                          itemBuilder: (context, index) =>
                              buildServiceListItem(services[index]),
                        ),
                ),
    );
  }
}
