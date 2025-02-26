// chat_box_widget.dart
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/models/chat_message.dart';
import 'package:psbs_app_flutter/models/user.dart';
import 'package:psbs_app_flutter/services/signal_r_service.dart';
import 'package:psbs_app_flutter/services/user_service.dart';
import 'package:psbs_app_flutter/utils/dialog_utils.dart';
import 'package:intl/intl.dart'; // For formatting date
import 'package:flutter/foundation.dart' as foundation;

class ChatBoxWidget extends StatefulWidget {
  final User currentUser;
  final User? chatUser; // The user you're chatting with, can be null
  final String chatId;
  final bool isSupportChat;

  ChatBoxWidget({
    required this.currentUser,
    this.chatUser,
    required this.chatId,
    required this.isSupportChat,
  });

  @override
  _ChatBoxWidgetState createState() => _ChatBoxWidgetState();
}

class _ChatBoxWidgetState extends State<ChatBoxWidget> {
  bool _openEmoji = false;
  List<ChatMessage> _chat = [];
  String _text = "";
  Map<String, User> _userMap = {};
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  @override
  void initState() {
    super.initState();
    _startSignalR();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_openEmoji) {
        _focusNode.requestFocus();
      }
    });
  }

  Future<void> _startSignalR() async {
    signalRService.invoke("JoinChatRoom", [widget.chatId]);

    signalRService.on("UpdateChatMessages", (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        final messages = (arguments[0] as List)
            .map((item) => ChatMessage.fromJson(item))
            .toList();
        _updateChat(messages);
      }
    });

    signalRService.on("ReceiveMessage", (arguments) {
      if (arguments != null && arguments.length >= 3) {
        final senderId = arguments[0].toString();
        final messageText = arguments[1].toString();
        final updatedAt = arguments[2].toString();
        _receiveMessage(senderId, messageText, updatedAt);
      }
    });

    signalRService.on("removestafffailed", (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        showErrorDialog(context, arguments[0].toString());
      }
    });

    signalRService.on("NewSupporterRequested", (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        showSuccessDialog(context, arguments[0].toString());
        Navigator.pop(context); // Go back to chat list
      }
    });

    signalRService.on("RequestNewSupporterFailed", (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        showErrorDialog(context, arguments[0].toString());
      }
    });

    signalRService.invoke(
        "GetChatMessages", [widget.chatId, widget.currentUser.accountId]);
  }

  Future<void> _updateChat(List<ChatMessage> messages) async {
    if (mounted) {
      // Check if the widget is mounted
      setState(() {
        _chat = messages;
      });
    }
    final senderIds = messages.map((msg) => msg.senderId).toSet().toList();
    await _fetchUserDetails(senderIds);
    _scrollToBottom();
  }

  void _receiveMessage(String senderId, String messageText, String updatedAt) {
    if (mounted) {
      // Check if the widget is mounted
      setState(() {
        _chat.add(ChatMessage(
          name: widget.currentUser.accountName,
          createdAt: updatedAt,
          senderId: senderId,
          text: messageText,
        ));
      });
    }
    _fetchUserDetails([senderId]);
    _scrollToBottom();
  }

  Future<void> _fetchUserDetails(List<String> senderIds) async {
    for (var id in senderIds) {
      if (!_userMap.containsKey(id)) {
        final user = await UserService.fetchUser(id);
        if (user != null && mounted) {
          // Check if mounted
          setState(() {
            _userMap[id] = user;
          });
        }
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  void _handleEmoji(Category category, Emoji emoji) {}

  Future<void> _handleSend() async {
    if (_text.trim().isEmpty) return;
    try {
      await signalRService.invoke(
          "SendMessage", [widget.chatId, widget.currentUser.accountId, _text]);
      setState(() {
        _text = "";
        _textController.clear();
      });
    } catch (err) {
      print("Error sending message: $err");
    }
  }

  void _handleKeyPress(String value) {
    if (value.endsWith('\n')) {
      _handleSend();
    }
  }

  void _handleExitRoom() {
    if (widget.currentUser.roleId == "user") {
      showConfirmationDialog(context, "Request another supporter?",
          "Are you sure you want to request?", () {
        signalRService.invoke("RequestNewSupporter", [widget.chatId]);
      });
    } else {
      showConfirmationDialog(context, "Leave Support Conversation?",
          "Are you sure you want to leave this support chat?", () {
        signalRService.invoke("RemoveStaffFromChatRoom",
            [widget.chatId, widget.currentUser.accountId]);
      });
    }
  }

  @override
  void dispose() {
    signalRService.invoke("LeaveChatRoom", [widget.chatId]);

    signalRService.off("UpdateChatMessages");
    signalRService.off("ReceiveMessage");
    signalRService.off("removestafffailed");
    signalRService.off("NewSupporterRequested");
    signalRService.off("RequestNewSupporterFailed");

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: AssetImage("default-avatar.png"),
            ),
            SizedBox(width: 10),
            Text(widget.isSupportChat && widget.currentUser.roleId == "user"
                ? "Support Agent"
                : widget.chatUser?.accountName ?? "Unknown"),
          ],
        ),
        actions: [
          if (widget.isSupportChat)
            IconButton(
              icon: Icon(Icons.exit_to_app),
              onPressed: _handleExitRoom,
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _chat.length,
              itemBuilder: (context, index) {
                final message = _chat[index];
                final isOwnMessage = widget.currentUser.roleId == "user"
                    ? message.senderId == widget.currentUser.accountId
                    : (widget.isSupportChat &&
                            widget.currentUser.accountId !=
                                widget.chatUser?.accountId &&
                            message.senderId != widget.chatUser?.accountId) ||
                        (!widget.isSupportChat &&
                            message.senderId == widget.currentUser.accountId);

                return Align(
                  alignment: isOwnMessage
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    padding: EdgeInsets.all(10),
                    margin: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                    decoration: BoxDecoration(
                      color: isOwnMessage ? Colors.blue[100] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _userMap[message.senderId]?.accountName ??
                              message.name,
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(message.text),
                        Text(
                          DateFormat('yyyy-MM-dd HH:mm')
                              .format(DateTime.parse(message.createdAt)),
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                    child: TextField(
                  controller: _textController,
                  focusNode: _focusNode, // Add this
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                  ),
                  onChanged: (value) {
                    setState(() {
                      _text = value;
                    });
                  },
                  onSubmitted: _handleKeyPress,
                  maxLines: null,
                  keyboardType: TextInputType.multiline,
                )),
                IconButton(
                  icon:
                      Icon(_openEmoji ? Icons.keyboard : Icons.emoji_emotions),
                  onPressed: () {
                    setState(() {
                      _openEmoji = !_openEmoji;
                    });
                    if (_openEmoji) {
                      _focusNode.unfocus();
                    } else {
                      // Add a small delay to ensure emoji picker is closed
                      Future.delayed(Duration(milliseconds: 100), () {
                        _focusNode.requestFocus();
                      });
                    }
                  },
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _handleSend,
                ),
              ],
            ),
          ),
          if (_openEmoji)
            SizedBox(
              height: 250,
              child: EmojiPicker(
                onEmojiSelected: (category, emoji) {
                  setState(() {
                    _textController.text += emoji.emoji;
                    _textController.selection = TextSelection.fromPosition(
                      TextPosition(offset: _textController.text.length),
                    );
                  });

                  // Close emoji picker and request keyboard focus
                  Future.delayed(Duration(milliseconds: 100), () {
                    _focusNode.requestFocus();
                  });
                },
                config: Config(
                  height: 256,
                  checkPlatformCompatibility: true,
                  emojiViewConfig: EmojiViewConfig(
                    emojiSizeMax: 28 *
                        (foundation.defaultTargetPlatform == TargetPlatform.iOS
                            ? 1.20
                            : 1.0),
                  ),
                  viewOrderConfig: const ViewOrderConfig(
                    top: EmojiPickerItem.categoryBar,
                    middle: EmojiPickerItem.emojiView,
                  ),
                  skinToneConfig: const SkinToneConfig(),
                  categoryViewConfig: const CategoryViewConfig(),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
