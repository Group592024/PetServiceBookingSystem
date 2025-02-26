import 'package:flutter_zustand/flutter_zustand.dart';
import 'package:psbs_app_flutter/models/user.dart';

// Define your store
class UseChatStore extends Store {
  String chatId = "";
  User? user;
  bool isSupportChat = false;
  UseChatStore(chatId, user, isSupportChat) : super(3);
  void changeChat(chatId, user, isSupport) => set({
        chatId: chatId,
        user: user,
        isSupportChat: isSupport,
      });
}
