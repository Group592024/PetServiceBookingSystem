import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:psbs_app_flutter/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PetEdit extends StatefulWidget {
  final String petId;

  const PetEdit({super.key, required this.petId});

  @override
  _PetEditState createState() => _PetEditState();
}

class _PetEditState extends State<PetEdit> {
  final _formKey = GlobalKey<FormState>();
  File? _image;
  String? _imagePreview;
  String? _oldPetImage;
  List<PetType> _petTypes = [];
  List<PetBreed> _breeds = [];
  bool _isLoading = false;
  final Map<String, String> _errors = {};
  bool _hasInteractedWithImage = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _furTypeController = TextEditingController();
  final TextEditingController _furColorController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  String? _selectedPetTypeId;
  String? _selectedBreedId;
  bool _petGender = true;
  DateTime? _dateOfBirth;
  String? _accountId;
  late String userId;
  @override
  void initState() {
    super.initState();
    _fetchPetData();
    _fetchPetTypes();
    _loadAccountId();
  }

  Future<void> _loadAccountId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getString('accountId') ?? ""; // Ensure it's never null
    });
  }

  Future<void> _fetchPetData() async {
    setState(() => _isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/pet/${widget.petId}'),
        headers: {
          "Content-Type": "application/json",
          if (token != null) "Authorization": "Bearer $token",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag']) {
          final petData = data['data'];
          setState(() {
            _nameController.text = petData['petName'];
            _weightController.text = petData['petWeight'].toString();
            _furTypeController.text = petData['petFurType'];
            _furColorController.text = petData['petFurColor'];
            _noteController.text = petData['petNote'];
            _petGender = petData['petGender'];
            _dateOfBirth = DateTime.parse(petData['dateOfBirth']);
            _selectedPetTypeId = petData['petTypeId'];
            _selectedBreedId = petData['petBreedId'];
            _accountId = petData['accountId'];
            _imagePreview = petData['petImage'] != null
                ? 'http://10.0.2.2:5050/pet-service${petData['petImage']}'
                : null;
            _oldPetImage = petData['petImage'];
          });

          if (_selectedPetTypeId != null) {
            await _fetchBreeds(_selectedPetTypeId!);
          }
        }
      }
    } catch (e) {
      _showErrorDialog('Failed to fetch pet details');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchPetTypes() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/petType'),
        headers: {
          "Content-Type": "application/json",
          if (token != null) "Authorization": "Bearer $token",
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _petTypes = data
              .where((type) => type['isDelete'] != true)
              .map((json) => PetType.fromJson(json))
              .toList();
        });
      }
    } catch (e) {
      _showErrorDialog('Failed to fetch pet types');
    }
  }

  Future<void> _fetchBreeds(String petTypeId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5050/api/petBreed/byPetType/$petTypeId'),
        headers: {
          "Content-Type": "application/json",
          if (token != null) "Authorization": "Bearer $token",
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag'] && data['data'] != null) {
          setState(() {
            _breeds = (data['data'] as List)
                .map((json) => PetBreed.fromJson(json))
                .toList();
          });
        } else {
          setState(() => _breeds = []);
          _showMessage('No breeds available for this pet type');
        }
      }
    } catch (e) {
      _showErrorDialog('Failed to fetch breeds');
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();

    showDialog(
      context: context,
      builder: (BuildContext context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Select Image Source',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 20),
              ListTile(
                leading: Icon(Icons.photo_library),
                title: Text('Photo Library'),
                onTap: () async {
                  Navigator.pop(context);
                  try {
                    final XFile? image = await picker.pickImage(
                      source: ImageSource.gallery,
                      imageQuality: 85,
                    );
                    if (image != null) {
                      setState(() {
                        _image = File(image.path);
                        _imagePreview = image.path;
                        _hasInteractedWithImage = true;
                      });
                    }
                  } catch (e) {
                    _showErrorDialog('Error accessing gallery');
                  }
                },
              ),
              ListTile(
                leading: Icon(Icons.camera_alt),
                title: Text('Camera'),
                onTap: () async {
                  Navigator.pop(context);
                  try {
                    final XFile? image = await picker.pickImage(
                      source: ImageSource.camera,
                      imageQuality: 85,
                    );
                    if (image != null) {
                      setState(() {
                        _image = File(image.path);
                        _imagePreview = image.path;
                        _hasInteractedWithImage = true;
                      });
                    }
                  } catch (e) {
                    _showErrorDialog('Error accessing camera');
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    bool confirm = await showDialog(
          context: context,
          builder: (context) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 0,
            backgroundColor: Colors.transparent,
            child: Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 10.0,
                    offset: Offset(0.0, 10.0),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.yellow.shade100,
                    radius: 45,
                    child: Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.orange,
                      size: 50,
                    ),
                  ),
                  SizedBox(height: 20),
                  Text(
                    "Are you sure?",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.orange,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Do you want to update this \n pet's information?\nThis action may affect related data in the system.",
                    style: TextStyle(fontSize: 20),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 30, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: Colors.blue),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Update',
                            style: TextStyle(
                              color: Colors.blue,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 10),
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 30, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ) ??
        false;

    if (!confirm) return;

    setState(() => _isLoading = true);

    try {
      setState(() => _isLoading = true);
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      var request = http.MultipartRequest(
        'PUT',
        Uri.parse('http://10.0.2.2:5050/api/pet'),
      );
      request.headers.addAll({
        'Content-Type': 'multipart/form-data',
        if (token != null) 'Authorization': 'Bearer $token',
      });
      request.fields.addAll({
        'petId': widget.petId,
        'accountId': _accountId!,
        'petName': _nameController.text,
        'petGender': _petGender.toString(),
        'dateOfBirth': DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
        'petBreedId': _selectedBreedId!,
        'petWeight': _weightController.text,
        'petFurType': _furTypeController.text,
        'petFurColor': _furColorController.text,
        'petNote': _noteController.text,
      });
      if (_image != null) {
        request.files.add(await http.MultipartFile.fromPath(
          'imageFile',
          _image!.path,
        ));
      }
      var response = await request.send();
      if (response.statusCode == 200) {
        _showSuccessDialog();
      } else {
        String responseData = await response.stream.bytesToString();
        var decodedResponse = jsonDecode(responseData);
        String errorMessage =
            decodedResponse['message'] ?? 'Lỗi không xác định';
        _showErrorDialog(errorMessage);
      }
    } catch (e) {
      _showErrorDialog('Lỗi khi cập nhật thú cưng: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 70,
              ),
              SizedBox(height: 20),
              Text(
                'Success!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Pet updated successfully',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  ),
                  child: Text(
                    'OK',
                    style: TextStyle(fontSize: 16),
                  ),
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (context) => MyHomePage(
                          accountId: userId,
                          title: 'Flutter Demo Home Page',
                          initialIndex: 1,
                        ),
                      ),
                      (route) => false,
                    );
                  }),
            ],
          ),
        ),
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 70,
              ),
              SizedBox(height: 20),
              Text(
                'Error',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
              ),
              SizedBox(height: 10),
              Text(
                message,
                style: TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                child: Text(
                  'OK',
                  style: TextStyle(fontSize: 16),
                ),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: EdgeInsets.all(10),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Edit Pet'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: _imagePreview != null
                            ? _image != null
                                ? Image.file(_image!, fit: BoxFit.cover)
                                : Image.network(_imagePreview!,
                                    fit: BoxFit.cover)
                            : Center(child: Text('Select an image')),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        labelText: 'Pet Name',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value?.isEmpty ?? true
                          ? 'Please enter pet name'
                          : null,
                    ),
                    SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<bool>(
                            value: _petGender,
                            decoration: InputDecoration(
                              labelText: 'Gender',
                              border: OutlineInputBorder(),
                            ),
                            items: [
                              DropdownMenuItem(
                                value: true,
                                child: Text('Male'),
                              ),
                              DropdownMenuItem(
                                value: false,
                                child: Text('Female'),
                              ),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _petGender = value!;
                              });
                            },
                          ),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            decoration: InputDecoration(
                              labelText: 'Date of Birth',
                              border: OutlineInputBorder(),
                            ),
                            readOnly: true,
                            controller: TextEditingController(
                              text: _dateOfBirth != null
                                  ? DateFormat('yyyy-MM-dd')
                                      .format(_dateOfBirth!)
                                  : '',
                            ),
                            onTap: () async {
                              final DateTime? picked = await showDatePicker(
                                context: context,
                                initialDate: _dateOfBirth ?? DateTime.now(),
                                firstDate: DateTime(2000),
                                lastDate: DateTime.now(),
                              );
                              if (picked != null) {
                                setState(() {
                                  _dateOfBirth = picked;
                                });
                              }
                            },
                            validator: (value) => value?.isEmpty ?? true
                                ? 'Please select date of birth'
                                : null,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedPetTypeId,
                      decoration: InputDecoration(
                        labelText: 'Pet Type',
                        border: OutlineInputBorder(),
                      ),
                      items: _petTypes.map((type) {
                        return DropdownMenuItem(
                          value: type.id,
                          child: Text(type.name),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedPetTypeId = value;
                          _selectedBreedId = null;
                          _fetchBreeds(value!);
                        });
                      },
                      validator: (value) =>
                          value == null ? 'Please select pet type' : null,
                    ),
                    SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedBreedId,
                      decoration: InputDecoration(
                        labelText: 'Breed',
                        border: OutlineInputBorder(),
                      ),
                      items: _breeds.map((breed) {
                        return DropdownMenuItem(
                          value: breed.id,
                          child: Text(breed.name),
                        );
                      }).toList(),
                      onChanged: _selectedPetTypeId == null
                          ? null
                          : (value) {
                              setState(() {
                                _selectedBreedId = value;
                              });
                            },
                      validator: (value) =>
                          value == null ? 'Please select breed' : null,
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      controller: _weightController,
                      decoration: InputDecoration(
                        labelText: 'Weight (kg)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter weight';
                        }
                        if (double.tryParse(value!) == null ||
                            double.parse(value) <= 0) {
                          return 'Please enter a valid weight';
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      controller: _furTypeController,
                      decoration: InputDecoration(
                        labelText: 'Fur Type',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value?.isEmpty ?? true
                          ? 'Please enter fur type'
                          : null,
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      controller: _furColorController,
                      decoration: InputDecoration(
                        labelText: 'Fur Color',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value?.isEmpty ?? true
                          ? 'Please enter fur color'
                          : null,
                    ),
                    SizedBox(height: 16),
                    TextFormField(
                      controller: _noteController,
                      decoration: InputDecoration(
                        labelText: 'Notes',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                      validator: (value) =>
                          value?.isEmpty ?? true ? 'Please enter notes' : null,
                    ),
                    SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(
                                horizontal: 40, vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            side: BorderSide(color: Colors.blue),
                          ),
                          onPressed: _handleSubmit,
                          child: Text(
                            'Update',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.blue,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: EdgeInsets.symmetric(
                                horizontal: 40, vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          onPressed: () {
                            Navigator.pushAndRemoveUntil(
                              context,
                              MaterialPageRoute(
                                builder: (context) => MyHomePage(
                                  accountId: userId,
                                  title: 'Flutter Demo Home Page',
                                  initialIndex: 1,
                                ),
                              ),
                              (route) => false,
                            );
                          },
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

// Add these classes at the end of the file
class PetType {
  final String id;
  final String name;

  PetType({required this.id, required this.name});

  factory PetType.fromJson(Map<String, dynamic> json) {
    return PetType(
      id: json['petType_ID'],
      name: json['petType_Name'],
    );
  }
}

class PetBreed {
  final String id;
  final String name;

  PetBreed({required this.id, required this.name});

  factory PetBreed.fromJson(Map<String, dynamic> json) {
    return PetBreed(
      id: json['petBreedId'],
      name: json['petBreedName'],
    );
  }
}
