import 'package:flutter_zustand/flutter_zustand.dart';
import 'package:psbs_app_flutter/models/user.dart';
import '../services/user_service.dart';

// Define your store
class UseUserStore extends Store {
  User? currentUser;
  bool isLoading = true;
  UseUserStore() : super(0);
  Future<void> loadUserDetails(accountId) async {
    final user = await UserService.fetchUser(accountId);
    set({currentUser: user, isLoading: false});
  }
}

UseUserStore useUserStore() => create(() => UseUserStore());
