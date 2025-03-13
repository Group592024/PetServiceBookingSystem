import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BookingServiceChoice extends StatefulWidget {
  final String cusId;
  final List<Map<String, dynamic>> bookingChoices;
  final Function(int) onRemove;
  final Function() onUpdate;

  BookingServiceChoice({
    required this.cusId,
    required this.bookingChoices,
    required this.onRemove,
    required this.onUpdate,
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
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://10.0.2.2:5050/api/Service"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      if (response.statusCode == 200) {
        Map<String, dynamic> responseBody = jsonDecode(response.body);
        if (responseBody.containsKey("data") && responseBody["data"] is List) {
          List<dynamic> data = responseBody["data"];
          setState(() {
            _services = data.map((service) {
              return {
                "id": service["serviceId"],
                "name": service["serviceName"]
              };
            }).toList();
          });
        } else {
          setState(() {
            _error = "Invalid data format from API.";
          });
        }
      } else {
        setState(() {
          _error =
              "Failed to fetch services. Status Code: ${response.statusCode}";
        });
      }
    } catch (error) {
      setState(() {
        _error = "Error fetching services: $error";
      });
    }
  }

  Future<void> _fetchPets() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://10.0.2.2:5050/api/pet/available/${widget.cusId}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      if (response.statusCode == 200) {
        Map<String, dynamic> responseBody = jsonDecode(response.body);
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

  Future<List<Map<String, dynamic>>> _fetchServiceVariants(
      String serviceId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse("http://10.0.2.2:5050/service/$serviceId"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        Map<String, dynamic> responseBody = jsonDecode(response.body);
        if (responseBody.containsKey("data") && responseBody["data"] is List) {
          List<dynamic> data = responseBody["data"];
          return data.map((variant) {
            return {
              "id": variant["serviceVariantId"],
              "content": variant["serviceContent"],
              "price": variant["servicePrice"],
            };
          }).toList();
        }
      }
    } catch (error) {
      print("Error fetching service variants: $error");
    }
    return [];
  }

  void _updateChoice(int index, String key, dynamic value) async {
    if (index >= widget.bookingChoices.length)
      return; // Prevent out-of-bounds errors

    setState(() {
      widget.bookingChoices[index][key] = value;

      if (key == "service") {
        // Only reset if it's a different service
        if (widget.bookingChoices[index]["service"] == null ||
            widget.bookingChoices[index]["service"]["id"] != value["id"]) {
          widget.bookingChoices[index]["serviceVariants"] = []; // Reset list
          widget.bookingChoices[index]["serviceVariant"] =
              null; // Reset selected variant
          widget.bookingChoices[index]["price"] = 0.0; // Reset price
        }
      }

      if (key == "serviceVariant") {
        widget.bookingChoices[index]["price"] =
            value != null ? value["price"] : 0.0;
      }
    });

    if (key == "service" && value != null) {
      List<Map<String, dynamic>> variants =
          await _fetchServiceVariants(value["id"]);

      // Update only if the list has changed
      setState(() {
        if (widget.bookingChoices[index]["serviceVariants"].isEmpty) {
          widget.bookingChoices[index]["serviceVariants"] = variants;
        }
      });
    }
    widget.onUpdate();
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
                  DropdownButtonFormField<Map<String, dynamic>>(
                    value: choice["service"],
                    hint: Text("Select Service"),
                    items:
                        _services.map<DropdownMenuItem<Map<String, dynamic>>>(
                      (service) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: service,
                          child: Text(service["name"]),
                        );
                      },
                    ).toList(),
                    onChanged: (value) {
                      _updateChoice(index, "service", value);
                    },
                  ),
                  DropdownButtonFormField<Map<String, dynamic>>(
                    value: choice["pet"],
                    hint: Text("Select Pet"),
                    items: _pets.map<DropdownMenuItem<Map<String, dynamic>>>(
                      (pet) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: pet,
                          child: Text(pet["name"]),
                        );
                      },
                    ).toList(),
                    onChanged: (value) {
                      _updateChoice(index, "pet", value);
                    },
                  ),
                  if (choice["serviceVariants"] != null &&
                      choice["serviceVariants"].isNotEmpty)
                    DropdownButtonFormField<Map<String, dynamic>>(
                      value: choice["serviceVariant"],
                      hint: Text("Select Service Variant"),
                      items: (choice["serviceVariants"]
                              as List<Map<String, dynamic>>)
                          .map<DropdownMenuItem<Map<String, dynamic>>>(
                              (variant) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: variant,
                          child: Text(
                              "${variant["content"]} - ${variant["price"]} VND"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        _updateChoice(index, "serviceVariant", value);
                      },
                    ),
                  Text("Price: ${choice["price"] ?? "0"} VND",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () => widget.onRemove(index),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
        if (_error.isNotEmpty)
          Text(_error, style: TextStyle(color: Colors.red)),
      ],
    );
  }
}
