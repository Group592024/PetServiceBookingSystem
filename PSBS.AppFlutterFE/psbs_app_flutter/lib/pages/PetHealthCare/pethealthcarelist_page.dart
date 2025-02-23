import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pethealthcaredetail_page.dart';

class PetHealthBookList extends StatefulWidget {
  @override
  _PetHealthBookListState createState() => _PetHealthBookListState();
}

class _PetHealthBookListState extends State<PetHealthBookList> {
  List pets = [];
  List medicines = [];
  String searchQuery = "";
  String? accountId;
  bool _isDisposed = false;
  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    loadAccountIdAndFetchData();
  }

  Future<void> loadAccountIdAndFetchData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? storedAccountId = prefs.getString('accountId');
    if (storedAccountId != null) {
      setState(() {
        accountId = storedAccountId;
      });
      await fetchPetHealthBooks();
    } else {
      print("No accountId found in SharedPreferences");
    }
  }

  Future<void> fetchPetHealthBooks() async {
    if (accountId == null) return;
    print("Account ID: $accountId");
    try {
      final petHealthResponse =
          await http.get(Uri.parse("http://localhost:5003/api/PetHealthBook"));
      final medicinesResponse =
          await http.get(Uri.parse("http://localhost:5003/Medicines"));
      final bookingsResponse =
          await http.get(Uri.parse("http://localhost:5201/Bookings"));
      final petsResponse =
          await http.get(Uri.parse("http://localhost:5010/api/pet"));
      if (!mounted) return;
      if (petHealthResponse.statusCode != 200 ||
          medicinesResponse.statusCode != 200 ||
          bookingsResponse.statusCode != 200 ||
          petsResponse.statusCode != 200) {
        print("Error fetching data from API");
        return;
      }
      var petHealthData = jsonDecode(petHealthResponse.body);
      if (petHealthData is List) {
        petHealthData = petHealthData;
      } else if (petHealthData is Map) {
        petHealthData = petHealthData['data'] ?? [];
      } else {
        petHealthData = [];
      }
      List medicinesData = jsonDecode(medicinesResponse.body) is List
          ? jsonDecode(medicinesResponse.body)
          : jsonDecode(medicinesResponse.body)['data'] ?? [];
      List bookingsData = jsonDecode(bookingsResponse.body) is List
          ? jsonDecode(bookingsResponse.body)
          : jsonDecode(bookingsResponse.body)['data'] ?? [];
      List petsData = jsonDecode(petsResponse.body) is List
          ? jsonDecode(petsResponse.body)
          : jsonDecode(petsResponse.body)['data'] ?? [];
      Map<String, String> bookingIdToAccountIdMap = {
        for (var booking in bookingsData)
          if (booking['bookingId'] != null && booking['accountId'] != null)
            booking['bookingId']: booking['accountId']
      };
      List filteredPetHealth = petHealthData.where((health) {
        String? bookingId = health['bookingId'];
        return bookingIdToAccountIdMap[bookingId] == accountId;
      }).toList();
      List petsWithDetails = filteredPetHealth.map((petHealth) {
        var booking = bookingsData.firstWhere(
          (b) => b['bookingId'] == petHealth['bookingId'],
          orElse: () => {},
        );
        var petInfo = petsData.firstWhere(
          (p) => p['accountId'] == accountId,
          orElse: () => {},
        );
        var medicineIds = petHealth['medicineIds'] ?? [];
        var medicineNames = medicinesData
            .where((m) => medicineIds.contains(m['medicineId']))
            .map((m) => m['medicineName'])
            .join(", ");
        return {
          'healthBookId': petHealth['healthBookId'] ?? "",
          'petName': petInfo?['petName'] ?? "Unknown",
          'dateOfBirth': petInfo?['dateOfBirth'] ?? "Unknown",
          'petImage': petInfo?['petImage'] ?? "",
          'medicineNames':
              medicineNames.isNotEmpty ? medicineNames : "No Medicine",
          'performBy': petHealth['performBy'] ?? "Unknown",
          'createdAt': petHealth['createdAt'] ?? "Unknown",
        };
      }).toList();
      setState(() {
        pets = petsWithDetails;
        medicines = medicinesData;
      });
    } catch (e) {
      print("Error fetching data: $e");
    }
  }

  String formatDate(String date) {
    try {
      DateTime parsedDate = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy').format(parsedDate);
    } catch (e) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text("Pet Health Book List"),
        backgroundColor: Colors.white,
      ),
      body: accountId == null
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Ô tìm kiếm
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: "Search...",
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      setState(() {
                        searchQuery = value.toLowerCase();
                      });
                    },
                  ),
                ),
                if (pets.isNotEmpty)
                  Column(
                    children: [
                      Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          image: DecorationImage(
                            image: pets.first['petImage'].isNotEmpty
                                ? NetworkImage(
                                    "http://localhost:5010${pets.first['petImage']}")
                                : AssetImage('assets/default-image.png')
                                    as ImageProvider,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      SizedBox(height: 10),
                      Text(
                        pets.first['petName'],
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        formatDate(pets.first['dateOfBirth']),
                        style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                            fontWeight: FontWeight.w500),
                        textAlign: TextAlign.center,
                      ),
                      Divider(),
                    ],
                  ),

                Expanded(
                  child: pets.isEmpty
                      ? Center(child: Text("No pets found"))
                      : ListView.builder(
                          itemCount: pets.where((pet) {
                            return pet['medicineNames']
                                    .toLowerCase()
                                    .contains(searchQuery) ||
                                formatDate(pet['createdAt'])
                                    .toLowerCase()
                                    .contains(searchQuery) ||
                                pet['performBy']
                                    .toLowerCase()
                                    .contains(searchQuery);
                          }).length,
                          itemBuilder: (context, index) {
                            var filteredPets = pets.where((pet) {
                              return pet['medicineNames']
                                      .toLowerCase()
                                      .contains(searchQuery) ||
                                  formatDate(pet['createdAt'])
                                      .toLowerCase()
                                      .contains(searchQuery) ||
                                  pet['performBy']
                                      .toLowerCase()
                                      .contains(searchQuery);
                            }).toList();

                            var pet = filteredPets[index];
                            return Card(
                              color: Colors.white,
                              elevation: 3,
                              margin: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              child: Padding(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 16.0, vertical: 12.0),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                "Medicine: ",
                                                style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold),
                                              ),
                                              SizedBox(
                                                  width:
                                                      8), // Khoảng cách giữa tiêu đề và giá trị
                                              Expanded(
                                                child:
                                                    Text(pet['medicineNames']),
                                              ),
                                            ],
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                "Performed By: ",
                                                style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold),
                                              ),
                                              SizedBox(width: 8),
                                              Expanded(
                                                child: Text(pet['performBy']),
                                              ),
                                            ],
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                "Created At: ",
                                                style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold),
                                              ),
                                              SizedBox(width: 8),
                                              Expanded(
                                                child: Text(formatDate(
                                                    pet['createdAt'])),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color: Colors.grey, width: 1),
                                      ),
                                      child: IconButton(
                                        icon: Icon(Icons.info,
                                            color: Colors.grey),
                                        onPressed: () {
                                          if (pet['healthBookId'] == null ||
                                              pet['healthBookId'].isEmpty) {
                                            print(
                                                "Error: healthBookId is null or empty");
                                            return;
                                          }
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  PetHealthBookDetail(
                                                healthBookId:
                                                    pet['healthBookId'],
                                                pet: pet,
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
                          },
                        ),
                )
              ],
            ),
    );
  }
}

Widget buildPetImage(String? imagePath) {
  if (imagePath != null && imagePath.isNotEmpty) {
    String imageUrl = "http://localhost:5010$imagePath";
    return Image.network(
      imageUrl,
      width: 50,
      height: 50,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Icon(Icons.error, size: 50, color: Colors.red);
      },
    );
  } else {
    return Icon(Icons.pets, size: 50);
  }
}
