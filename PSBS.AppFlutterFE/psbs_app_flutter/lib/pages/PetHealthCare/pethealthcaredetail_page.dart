import 'package:flutter/material.dart';

class PetHealthBookDetailScreen extends StatefulWidget {
  @override
  _PetHealthBookDetailScreenState createState() => _PetHealthBookDetailScreenState();
}

class _PetHealthBookDetailScreenState extends State<PetHealthBookDetailScreen> {
  String petImage = "";
  String petName = "Unknown";
  String dateOfBirth = "";
  String treatmentNames = "No Treatments Assigned";
  String performBy = "";
  String visitDate = "";
  String nextVisitDate = "";
  String medicineNames = "No Medicines Assigned";

  @override
  void initState() {
    super.initState();
    fetchPetHealthData();
  }

  Future<void> fetchPetHealthData() async {
    // Đây là nơi bạn sẽ gọi API để lấy dữ liệu, ở đây chỉ demo dữ liệu giả lập
    setState(() {
      petImage = "https://via.placeholder.com/300";
      petName = "Buddy";
      dateOfBirth = "01/01/2020";
      treatmentNames = "Vaccination, Deworming";
      performBy = "Dr. John Doe";
      visitDate = "12/02/2024";
      nextVisitDate = "12/05/2024";
      medicineNames = "Antibiotics, Vitamin C";
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Pet Health Book Detail")),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10.0),
                    child: Image.network(
                      petImage,
                      width: 300,
                      height: 300,
                      fit: BoxFit.cover,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    petName,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  Text(dateOfBirth, style: TextStyle(fontSize: 16)),
                ],
              ),
            ),
            SizedBox(height: 20),
            _buildDetailItem("Treatment", treatmentNames),
            _buildDetailItem("Performed By", performBy),
            _buildDetailItem("Visit Date", visitDate),
            _buildDetailItem("Next Visit Date", nextVisitDate),
            _buildDetailItem("Medicine", medicineNames),
            SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: Text("Back"),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 5),
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(12.0),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Text(value, style: TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }
}
