import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:psbs_app_flutter/pages/pet/pet_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PetCreate extends StatefulWidget {
  const PetCreate({super.key});

  @override
  _PetCreateState createState() => _PetCreateState();
}

class _PetCreateState extends State<PetCreate> {
  final _formKey = GlobalKey<FormState>();
  File? _image;
  List<PetType> _petTypes = [];
  List<PetBreed> _breeds = [];
  bool _isLoading = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _furTypeController = TextEditingController();
  final TextEditingController _furColorController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  String? _selectedPetTypeId;
  String? _selectedBreedId;
  bool _petGender = true;
  DateTime? _dateOfBirth;

  @override
  void initState() {
    super.initState();
    _fetchPetTypes();
  }

  Future<void> _fetchPetTypes() async {
    try {
      final response =
          await http.get(Uri.parse('http://192.168.1.17:5010/api/petType'));
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
      final response = await http.get(
        Uri.parse(
            'http://192.168.1.17:5010/api/petBreed/byPetType/$petTypeId'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['flag'] == true && data['data'] != null) {
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
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Select Image Source'),
            content: SingleChildScrollView(
              child: ListBody(
                children: <Widget>[
                  GestureDetector(
                    child: ListTile(
                      leading: Icon(Icons.photo_library),
                      title: Text('Photo Library'),
                    ),
                    onTap: () async {
                      Navigator.pop(context);
                      try {
                        final XFile? image = await picker.pickImage(
                          source: ImageSource.gallery,
                          imageQuality: 85,
                        );
                        if (image != null) {
                          setState(() => _image = File(image.path));
                        }
                      } catch (e) {
                        print('Gallery Error: $e');
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                              content: Text('Error accessing gallery: $e')),
                        );
                      }
                    },
                  ),
                  GestureDetector(
                    child: ListTile(
                      leading: Icon(Icons.photo_camera),
                      title: Text('Camera'),
                    ),
                    onTap: () async {
                      Navigator.pop(context);
                      try {
                        final XFile? image = await picker.pickImage(
                          source: ImageSource.camera,
                          imageQuality: 85,
                        );
                        if (image != null) {
                          setState(() => _image = File(image.path));
                        }
                      } catch (e) {
                        print('Camera Error: $e');
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error accessing camera: $e')),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          );
        });
  }

  Future<void> _submitForm() async {
  if (!_formKey.currentState!.validate() || _image == null) {
    if (_image == null) {
      _showErrorDialog('Please select a pet image');
    }
    return;
  }

  setState(() => _isLoading = true);

  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String accountId = prefs.getString('accountId') ?? '';

    if (accountId.isEmpty) {
      _showErrorDialog('User not logged in.');
      return;
    }

    var request = http.MultipartRequest(
      'POST',
      Uri.parse('http://192.168.1.17:5010/api/pet'),
    );

    request.fields.addAll({
      'petName': _nameController.text,
      'petGender': _petGender.toString(),
      'dateOfBirth': DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
      'petBreedId': _selectedBreedId!,
      'petWeight': _weightController.text,
      'petFurType': _furTypeController.text,
      'petFurColor': _furColorController.text,
      'petNote': _noteController.text,
      'accountId': accountId,
    });

    request.files.add(await http.MultipartFile.fromPath(
      'imageFile',
      _image!.path,
    ));

    final response = await request.send();
    final responseData = await response.stream.bytesToString();
    final jsonResponse = json.decode(responseData);

    if (jsonResponse['flag'] == true) {
      _showSuccessDialog();
    } else {
      _showErrorDialog(jsonResponse['message'] ?? 'Failed to create pet');
    }
  } catch (e) {
    _showErrorDialog('Failed to create pet: $e');
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
        child: Container(
          padding: EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 70,
              ),
              SizedBox(height: 15),
              Text(
                'Success!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 15),
              Text(
                'Pet created successfully',
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
                  Navigator.of(context).pop();
                  Navigator.pop(context);
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PetPage(),
                    ),
                  );
                },
              ),
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
        child: Container(
          padding: EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 70,
              ),
              SizedBox(height: 15),
              Text(
                'Error',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
              ),
              SizedBox(height: 15),
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
        content: Container(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Text(
            message,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white,
            ),
          ),
        ),
        backgroundColor: Colors.blue,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: EdgeInsets.all(10),
        duration: Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create New Pet'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Image picker
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: _image != null
                            ? Image.file(_image!, fit: BoxFit.cover)
                            : Center(child: Text('Select an image')),
                      ),
                    ),
                    SizedBox(height: 16),

                    // Pet name
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

                    // Gender and Date of Birth row
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
                              setState(() => _petGender = value!);
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
                            onTap: () async {
                              final date = await showDatePicker(
                                context: context,
                                initialDate: _dateOfBirth ?? DateTime.now(),
                                firstDate: DateTime(2000),
                                lastDate: DateTime.now(),
                              );
                              if (date != null) {
                                setState(() => _dateOfBirth = date);
                              }
                            },
                            validator: (value) => _dateOfBirth == null
                                ? 'Please select date of birth'
                                : null,
                            controller: TextEditingController(
                              text: _dateOfBirth == null
                                  ? ''
                                  : DateFormat('yyyy-MM-dd')
                                      .format(_dateOfBirth!),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),

                    // Pet Type and Breed
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
                          if (value != null) {
                            _fetchBreeds(value);
                          }
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
                              setState(() => _selectedBreedId = value);
                            },
                      validator: (value) =>
                          value == null ? 'Please select breed' : null,
                    ),
                    SizedBox(height: 16),

                    // Weight
                    TextFormField(
                      controller: _weightController,
                      decoration: InputDecoration(
                        labelText: 'Weight (kg)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter weight';
                        }
                        if (double.tryParse(value) == null ||
                            double.parse(value) <= 0) {
                          return 'Please enter a valid weight';
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: 16),

                    // Fur Type and Color
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

                    // Notes
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

                    // Submit button
                    ElevatedButton(
                      onPressed: _submitForm,
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 16.0),
                        child: Text(
                          'Create Pet',
                          style: TextStyle(fontSize: 18),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _weightController.dispose();
    _furTypeController.dispose();
    _furColorController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}

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
