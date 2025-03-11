import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:psbs_app_flutter/pages/Services/service_detail.dart';

class ServicePage extends StatefulWidget {
  const ServicePage({super.key});

  @override
  _ServicePageState createState() => _ServicePageState();
}

class _ServicePageState extends State<ServicePage> {
  List<dynamic> services = [];
  bool isLoading = true;

  // Fetch services data
  Future<void> fetchServices() async {
    try {
      final responseServices = await http.get(
          Uri.parse('http://10.66.187.111:5023/api/Service?showAll=false'));
      if (responseServices.statusCode == 200) {
        final dataServices = json.decode(responseServices.body);

        print(dataServices);

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
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(1)),
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
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              service['serviceImage'] != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        'http://10.66.187.111:5023${service['serviceImage']}',
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    )
                  : SizedBox(
                      height: 200,
                      child: Center(child: Text('No Image')),
                    ),
              SizedBox(height: 10),
              Text(
                service['serviceName'] ?? 'No Name',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text(
                'Type: ${service['serviceType'] != null ? service['serviceType']['typeName'] : 'Unknown'}',
                style: TextStyle(
                    fontSize: 15,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey),
              ),
              SizedBox(height: 20),
              Center(
                child: SizedBox(
                  width: 350,
                  child: ElevatedButton(
                    onPressed: null,
                    style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(Colors.green[400]),
                    ),
                    child: Text(
                      'See more',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black),
                    ),
                  ),
                ),
              )
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
        title: Text('Services for Your Pets'),
        backgroundColor: Colors.blue,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : services.isEmpty
              ? Center(child: Text('No services available'))
              : RefreshIndicator(
                  onRefresh: fetchServices,
                  child: ListView.builder(
                    itemCount: services.length,
                    itemBuilder: (context, index) =>
                        buildServiceCard(services[index]),
                  ),
                ),
    );
  }
}
