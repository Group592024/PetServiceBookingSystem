import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BookingServiceChoice extends StatefulWidget {
  final String cusId;
  final List<Map<String, dynamic>> bookingChoices;
  final Function(int) onRemove;

  BookingServiceChoice({
    required this.cusId,
    required this.bookingChoices,
    required this.onRemove,
  });

  @override
  _BookingServiceChoiceState createState() => _BookingServiceChoiceState();
}

class _BookingServiceChoiceState extends State<BookingServiceChoice> {
  List<Map<String, dynamic>> _services = [];
  List<Map<String, dynamic>> _pets = [];
  String _error = "";

  @override
  void initState() {
    super.initState();
    _fetchServices();
    _fetchPets();
  }

  Future<void> _fetchServices() async {
    try {
      final response = await http.get(Uri.parse("http://127.0.0.1:5023/api/Service"));
      if (response.statusCode == 200) {
        Map<String, dynamic> responseBody = jsonDecode(response.body);

      // Ensure that 'data' exists and is a list
      if (responseBody.containsKey("data") && responseBody["data"] is List) {
        List<dynamic> data = responseBody["data"];
        setState(() {
          _pets = data.map((service) {
            return {"id": service["serviceId"], "name": service["serviceName"]};
          }).toList();
        });
      } else {
        setState(() {
          _error = "Invalid data format from API.";
        });
      }
      } else {
        throw Exception("Failed to load services");
      }
    } catch (error) {
      print("Error fetching services: $error");
    }
  }

  Future<void> _fetchPets() async {
  try {
    final response = await http.get(Uri.parse("http://127.0.0.1:5010/api/pet/available/${widget.cusId}"));
    if (response.statusCode == 200) {
      Map<String, dynamic> responseBody = jsonDecode(response.body);

      // Ensure that 'data' exists and is a list
      if (responseBody.containsKey("data") && responseBody["data"] is List) {
        List<dynamic> data = responseBody["data"];
        setState(() {
          _pets = data.map((pet) {
            return {"id": pet["petId"], "name": pet["petName"]};
          }).toList();
        });
      } else {
        setState(() {
          _error = "Invalid data format from API.";
        });
      }
    } else {
      setState(() {
        _error = "Failed to fetch pets. Status Code: ${response.statusCode}";
      });
    }
  } catch (error) {
    setState(() {
      _error = "Error fetching pets: $error";
    });
  }
}


  Future<List<Map<String, dynamic>>> _fetchServiceVariants(String serviceId) async {
    try {
      final response = await http.get(Uri.parse("http://127.0.0.1:5023/service/$serviceId"));
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return data.map((variant) {
          return {
            "id": variant["serviceVariantId"],
            "content": variant["serviceContent"],
            "price": variant["servicePrice"],
          };
        }).toList();
      }
    } catch (error) {
      print("Error fetching service variants: $error");
    }
    return [];
  }

  void _updateChoice(int index, String key, dynamic value) async {
    setState(() {
      widget.bookingChoices[index][key] = value;
    });

    if (key == "service" && value != null) {
      List<Map<String, dynamic>> variants = await _fetchServiceVariants(value["id"]);
      setState(() {
        widget.bookingChoices[index]["serviceVariants"] = variants;
      });
    }

    if (key == "serviceVariant" && value != null) {
      setState(() {
        widget.bookingChoices[index]["price"] = value["price"];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ...widget.bookingChoices.asMap().entries.map((entry) {
          int index = entry.key;
          var choice = entry.value;

          return Card(
            margin: EdgeInsets.symmetric(vertical: 8),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                children: [
                  DropdownButtonFormField(
                    value: choice["service"],
                    hint: Text("Select Service"),
                    items: _services.map((service) {
                      return DropdownMenuItem(
                        value: service,
                        child: Text(service["name"]),
                      );
                    }).toList(),
                    onChanged: (value) {
                      _updateChoice(index, "service", value);
                    },
                  ),

                  DropdownButtonFormField(
                    value: choice["pet"],
                    hint: Text("Select Pet"),
                    items: _pets.map((pet) {
                      return DropdownMenuItem(
                        value: pet,
                        child: Text(pet["name"]),
                      );
                    }).toList(),
                    onChanged: (value) {
                      _updateChoice(index, "pet", value);
                    },
                  ),

                  if (choice["serviceVariants"].isNotEmpty)
                    DropdownButtonFormField(
                      value: choice["serviceVariant"],
                      hint: Text("Select Service Variant"),
                      items: choice["serviceVariants"].map<DropdownMenuItem<Map<String, dynamic>>>((variant) {
                        return DropdownMenuItem(
                          value: variant,
                          child: Text("${variant["content"]} - ${variant["price"]} VND"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        _updateChoice(index, "serviceVariant", value);
                      },
                    ),

                  Text("Price: ${choice["price"]} VND", style: TextStyle(fontWeight: FontWeight.bold)),

                  IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () => widget.onRemove(index),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
        if (_error.isNotEmpty) Text(_error, style: TextStyle(color: Colors.red)),
      ],
    );
  }
}
