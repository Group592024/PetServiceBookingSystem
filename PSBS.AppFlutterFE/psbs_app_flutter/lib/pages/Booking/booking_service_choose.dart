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
  final Function(BookingChoice) onVariantChange;

  const BookingServiceChoice({
    required this.cusId,
    required this.bookingChoices,
    required this.onRemove,
    required this.onUpdate,
    required this.onVariantChange,
    Key? key,
  }) : super(key: key);

  @override
  _BookingServiceChoiceState createState() => _BookingServiceChoiceState();
}

class _BookingServiceChoiceState extends State<BookingServiceChoice> {
  String _error = "";

  void _updateVariant(int index, ServiceVariant newVariant) {
    print('=== BookingServiceChoice: _updateVariant ===');
    print('Previous variant: ${widget.bookingChoices[index].serviceVariant?.content} - ${widget.bookingChoices[index].serviceVariant?.price}');
    print('New variant: ${newVariant.content} - ${newVariant.price}');
    
    final updatedChoice = BookingChoice(
      service: widget.bookingChoices[index].service,
      pet: widget.bookingChoices[index].pet,
      serviceVariant: newVariant,
      price: newVariant.price,  // Update price with new variant price
      bookingDate: widget.bookingChoices[index].bookingDate,
      variants: widget.bookingChoices[index].variants,
    );

    setState(() {
      widget.bookingChoices[index] = updatedChoice;
    });

    // Notify parent components of the change
    widget.onVariantChange(updatedChoice);
    widget.onUpdate();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ...widget.bookingChoices.asMap().entries.map((entry) {
          final index = entry.key;
          final choice = entry.value;

          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Service: ${choice.service.name}"),
                  SizedBox(height: 8),
                  Text("Pet: ${choice.pet.name}"),
                  SizedBox(height: 16),
                  
                  if (choice.variants.isNotEmpty)
                    DropdownButtonFormField<ServiceVariant>(
                      value: choice.serviceVariant,  // This will show the current variant (initially the first one)
                      decoration: InputDecoration(
                        labelText: "Service Variant",
                        border: OutlineInputBorder(),
                      ),
                      items: choice.variants.map((variant) {
                        return DropdownMenuItem<ServiceVariant>(
                          value: variant,
                          child: Text("${variant.content} - ${variant.price} VND"),
                        );
                      }).toList(),
                      onChanged: (ServiceVariant? value) {
                        if (value != null) {
                          _updateVariant(index, value);
                        }
                      },
                    ),
                  
                  SizedBox(height: 16),
                  Text(
                    "Price: ${choice.price.toStringAsFixed(2)} VND",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
        
        if (_error.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              _error,
              style: TextStyle(color: Colors.red),
            ),
          ),
      ],
    );
  }
}
