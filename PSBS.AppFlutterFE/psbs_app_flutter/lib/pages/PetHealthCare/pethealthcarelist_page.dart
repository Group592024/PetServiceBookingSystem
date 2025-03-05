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
  List mergedPets = [];
  String searchQuery = "";
  String? accountId;
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
      await fetchData();
    } else {
      print("No accountId found in SharedPreferences");
    }
  }

  Future<void> fetchData() async {
    if (accountId == null) return;
    try {
      final petHealthRes =
          await http.get(Uri.parse("http://10.0.2.2:5003/api/PetHealthBook"));
      final medicinesRes =
          await http.get(Uri.parse("http://10.0.2.2:5003/Medicines"));
      final petsRes = await http.get(Uri.parse("http://10.0.2.2:5010/api/pet"));
      final bookingServiceItemsRes = await http.get(Uri.parse(
          "http://10.0.2.2:5023/api/BookingServiceItems/GetBookingServiceList"));

      if (petHealthRes.statusCode != 200 ||
          medicinesRes.statusCode != 200 ||
          petsRes.statusCode != 200 ||
          bookingServiceItemsRes.statusCode != 200) {
        return;
      }
      var petHealthData = jsonDecode(petHealthRes.body);
      if (petHealthData is Map) {
        petHealthData = petHealthData['data'] ?? [];
      }
      var medicinesData = jsonDecode(medicinesRes.body);
      if (medicinesData is Map) {
        medicinesData = medicinesData['data'] ?? [];
      }
      var petsData = jsonDecode(petsRes.body);
      if (petsData is Map) {
        petsData = petsData['data'] ?? [];
      }
      var bookingServiceItemsData = jsonDecode(bookingServiceItemsRes.body);
      if (bookingServiceItemsData is Map) {
        bookingServiceItemsData = bookingServiceItemsData['data'] ?? [];
      }
      List accountPets =
          petsData.where((p) => p['accountId'] == accountId).toList();
      List result = accountPets.map((pet) {
        List healthForThisPet = (petHealthData as List).where((health) {
          var bsi = bookingServiceItemsData.firstWhere(
            (item) =>
                item['bookingServiceItemId'] == health['bookingServiceItemId'],
            orElse: () => null,
          );
          if (bsi == null) return false;
          return bsi['petId'] == pet['petId'];
        }).toList();
        List healthRecords = healthForThisPet.map((health) {
          List medIds = health['medicineIds'] ?? [];
          List medNames = (medicinesData as List)
              .where((m) => medIds.contains(m['medicineId']))
              .map((m) => m['medicineName'])
              .toList();
          String medicineNames = medNames.isNotEmpty
              ? medNames.join(", ")
              : "No Medicines Assigned";
          return {
            'healthBookId': health['healthBookId'] ?? "",
            'medicineNames': medicineNames,
            'performBy': health['performBy'] ?? "Unknown",
            'createdAt': health['createdAt'] ?? "",
          };
        }).toList();
        return {
          'petName': pet['petName'] ?? "Unknown",
          'dateOfBirth': pet['dateOfBirth'] ?? "",
          'petImage': pet['petImage'] ?? "",
          'healthBooks': healthRecords,
        };
      }).toList();
      setState(() {
        mergedPets = result;
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
    List filteredPets = mergedPets.where((record) {
      String petName = record['petName'].toString().toLowerCase();
      String healthInfo = "";
      if (record['healthBooks'] is List) {
        healthInfo = (record['healthBooks'] as List)
            .map((h) => "${h['medicineNames']} ${h['performBy']}")
            .join(" ")
            .toLowerCase();
      }
      return petName.contains(searchQuery) || healthInfo.contains(searchQuery);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text("Pet Health Book List"),
        backgroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: filteredPets.isEmpty
                ? Center(child: Text("No Health Books Found"))
                : ListView.builder(
                    itemCount: filteredPets.length,
                    itemBuilder: (context, index) {
                      var petRecord = filteredPets[index];
                      return Card(
                        color: Colors.white,
                        elevation: 3,
                        margin:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      image: DecorationImage(
                                        image: petRecord['petImage'].isNotEmpty
                                            ? NetworkImage(
                                                "http://10.0.2.2:5010${petRecord['petImage']}")
                                            : AssetImage(
                                                    'assets/default-image.png')
                                                as ImageProvider,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        petRecord['petName'],
                                        style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        formatDate(petRecord['dateOfBirth']),
                                        style: TextStyle(
                                            fontSize: 16, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Divider(),
                              petRecord['healthBooks'].isEmpty
                                  ? Text("No Health Book Records")
                                  : Column(
                                      children: List.generate(
                                        petRecord['healthBooks'].length,
                                        (i) {
                                          var health =
                                              petRecord['healthBooks'][i];
                                          return ListTile(
                                            title: Text(
                                              "Medicine: ${health['medicineNames']}",
                                            ),
                                            subtitle: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                    "Performed By: ${health['performBy']}"),
                                                Text(
                                                    "Created At: ${formatDate(health['createdAt'])}"),
                                              ],
                                            ),
                                            trailing: IconButton(
                                              icon: Icon(Icons.info,
                                                  color: Colors.grey),
                                              onPressed: () {
                                                if (health['healthBookId'] ==
                                                        null ||
                                                    health['healthBookId']
                                                        .isEmpty) {
                                                  print(
                                                      "Error: healthBookId is null or empty");
                                                  return;
                                                }
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (context) =>
                                                        PetHealthBookDetail(
                                                      healthBookId: health[
                                                          'healthBookId'],
                                                      pet: petRecord,
                                                    ),
                                                  ),
                                                );
                                              },
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
          ),
        ],
      ),
    );
  }
}

Widget buildPetImage(String? imagePath) {
  if (imagePath != null && imagePath.isNotEmpty) {
    String imageUrl = "http://10.0.2.2:5010$imagePath";
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
