import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../models/booking_service_type.dart';

class BookingServiceChoice extends StatefulWidget {
  final String cusId;
  final List<BookingChoice> bookingChoices;
  final Function(int) onRemove;
  final Function() onUpdate;

  const BookingServiceChoice({
    required this.cusId,
    required this.bookingChoices,
    required this.onRemove,
    required this.onUpdate,
    Key? key,
  }) : super(key: key);

  @override
  _BookingServiceChoiceState createState() => _BookingServiceChoiceState();
}

class _BookingServiceChoiceState extends State<BookingServiceChoice> {
  List<Service> _services = [];
  List<Pet> _pets = [];
  String _error = "";

  @override
  void initState() {
    super.initState();
    _fetchServices();
    _fetchPets();
  }

  Future<void> _fetchServices() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://127.0.0.1:5050/api/Service"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        if (responseBody.containsKey("data") && responseBody["data"] is List) {
          setState(() {
            _services = (responseBody["data"] as List)
                .map((service) => Service.fromMap(service))
                .toList();
          });
        }
      } else {
        setState(() {
          _error = "Failed to fetch services. Status Code: ${response.statusCode}";
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
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://127.0.0.1:5050/api/pet/available/${widget.cusId}"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        if (responseBody.containsKey("data") && responseBody["data"] is List) {
          setState(() {
            _pets = (responseBody["data"] as List)
                .map((pet) => Pet.fromMap(pet))
                .toList();
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

  Future<List<ServiceVariant>> _fetchServiceVariants(String serviceId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final response = await http.get(
        Uri.parse("http://127.0.0.1:5050/api/ServiceVariant/service/$serviceId"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        if (responseBody.containsKey("data") && responseBody["data"] is List) {
          return (responseBody["data"] as List)
              .map((variant) => ServiceVariant.fromMap(variant))
              .toList();
        }
      }
    } catch (error) {
      print("Error fetching service variants: $error");
    }
    return [];
  }

  Future<void> _updateService(int index, Service service) async {
    final variants = await _fetchServiceVariants(service.id);
    setState(() {
      widget.bookingChoices[index] = BookingChoice(
        service: service,
        pet: widget.bookingChoices[index].pet,
        serviceVariant: variants.isNotEmpty ? variants.first : null,
        price: variants.isNotEmpty ? variants.first.price : 0.0,
        bookingDate: widget.bookingChoices[index].bookingDate,
        variants: variants,
      );
    });
    widget.onUpdate();
  }

  void _updatePet(int index, Pet pet) {
    setState(() {
      widget.bookingChoices[index] = BookingChoice(
        service: widget.bookingChoices[index].service,
        pet: pet,
        serviceVariant: widget.bookingChoices[index].serviceVariant,
        price: widget.bookingChoices[index].price,
        bookingDate: widget.bookingChoices[index].bookingDate,
        variants: widget.bookingChoices[index].variants,
      );
    });
    widget.onUpdate();
  }

 void _updateVariant(int index, ServiceVariant? variant) {
  setState(() {
    widget.bookingChoices[index] = BookingChoice(
      service: widget.bookingChoices[index].service,
      pet: widget.bookingChoices[index].pet,
      serviceVariant: variant,
      price: variant?.price ?? 0.0,
      bookingDate: widget.bookingChoices[index].bookingDate,
      variants: widget.bookingChoices[index].variants,
    );
  });
  widget.onUpdate();
}

  // In the build method of _BookingServiceChoiceState:
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      ...widget.bookingChoices.asMap().entries.map((entry) {
        final index = entry.key;
        final choice = entry.value;

        // Ensure unique services by id
        final uniqueServices = _services.fold<Map<String, Service>>({}, (map, service) {
          map[service.id] = service;
          return map;
        }).values.toList();

        // Ensure unique pets by id
        final uniquePets = _pets.fold<Map<String, Pet>>({}, (map, pet) {
          map[pet.id] = pet;
          return map;
        }).values.toList();

        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              children: [
                // Service Dropdown
                DropdownButtonFormField<Service>(
                  value: choice.service,
                  hint: const Text("Select Service"),
                  items: uniqueServices.map((service) {
                    return DropdownMenuItem<Service>(
                      value: service,
                      child: Text(service.name),
                    );
                  }).toList(),
                  onChanged: (Service? value) {
                    if (value != null) {
                      _updateService(index, value);
                    }
                  },
                ),

                // Pet Dropdown
                DropdownButtonFormField<Pet>(
                  value: choice.pet,
                  hint: const Text("Select Pet"),
                  items: uniquePets.map((pet) {
                    return DropdownMenuItem<Pet>(
                      value: pet,
                      child: Text(pet.name),
                    );
                  }).toList(),
                  onChanged: (Pet? value) {
                    if (value != null) {
                      _updatePet(index, value);
                    }
                  },
                ),

                // Service Variant Dropdown
                if (choice.variants.isNotEmpty)
  DropdownButtonFormField<ServiceVariant>(
    value: choice.serviceVariant, // This will show the pre-selected first variant
    hint: const Text("Select Service Variant"),
    items: choice.variants.map((variant) {
      return DropdownMenuItem<ServiceVariant>(
        value: variant,
        child: Text(
          "${variant.content} - ${variant.price} VND",
        ),
      );
    }).toList(),
    onChanged: (ServiceVariant? value) {
      if (value != null) {
        _updateVariant(index, value);
      }
    },
  ),

                Text(
                  "Price: ${choice.price.toStringAsFixed(2)} VND",
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => widget.onRemove(index),
                ),
              ],
            ),
          ),
        );
      }).toList(),
      if (_error.isNotEmpty)
        Text(
          _error,
          style: const TextStyle(color: Colors.red),
        ),
    ],
  );
}
}