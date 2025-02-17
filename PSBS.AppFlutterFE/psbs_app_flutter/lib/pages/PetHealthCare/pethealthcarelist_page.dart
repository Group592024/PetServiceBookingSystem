import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class PetHealthBookListCus extends StatefulWidget {
  @override
  _PetHealthBookListCusState createState() => _PetHealthBookListCusState();
}

class _PetHealthBookListCusState extends State<PetHealthBookListCus> {
  List<dynamic> pets = [];
  List<dynamic> filteredPets = [];
  String searchQuery = "";

  @override
  void initState() {
    super.initState();
    fetchPetHealthBooks();
  }

  Future<void> fetchPetHealthBooks() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:5003/api/PetHealthBook'));
      if (response.statusCode == 200) {
        setState(() {
          pets = json.decode(response.body)['data'];
          filteredPets = pets;
        });
      } else {
        throw Exception('Failed to load data');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  void filterPets(String query) {
    setState(() {
      searchQuery = query.toLowerCase();
      filteredPets = pets.where((pet) {
        String medicineNames = pet['medicineNames']?.toLowerCase() ?? "";
        String performBy = pet['performBy']?.toLowerCase() ?? "";
        String createdAt = DateFormat('dd/MM/yyyy').format(DateTime.parse(pet['createdAt'] ?? ""));
        return medicineNames.contains(searchQuery) ||
            performBy.contains(searchQuery) ||
            createdAt.contains(searchQuery);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Pet Health Book List")),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            TextField(
              onChanged: filterPets,
              decoration: InputDecoration(
                hintText: "Search Accounts...",
                border: OutlineInputBorder(),
                suffixIcon: Icon(Icons.search),
              ),
            ),
            SizedBox(height: 10),
            Expanded(
              child: ListView.builder(
                itemCount: filteredPets.length,
                itemBuilder: (context, index) {
                  var pet = filteredPets[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundImage: pet['petImage'] != null
                            ? NetworkImage('http://localhost:5010${pet['petImage']}')
                            : null,
                        child: pet['petImage'] == null ? Icon(Icons.pets) : null,
                      ),
                      title: Text(pet['petName'] ?? "Unknown"),
                      subtitle: Text("DOB: ${pet['dateOfBirth'] ?? "Unknown"}"),
                      trailing: IconButton(
                        icon: Icon(Icons.visibility),
                        onPressed: () {},
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}