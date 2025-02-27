import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';
import 'package:psbs_app_flutter/models/chat_message.dart';
import 'package:psbs_app_flutter/models/user.dart';
import 'package:psbs_app_flutter/services/signal_r_service.dart';
import 'package:psbs_app_flutter/utils/dialog_utils.dart';
import 'package:intl/intl.dart';
import 'package:flutter/foundation.dart' as foundation;

class ChatBoxWidget extends StatefulWidget {
  final User currentUser;
  final User? chatUser;
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
        Navigator.pop(context);
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
      setState(() {
        _chat = messages;
      });
    }
    _scrollToBottom();
  }

  void _receiveMessage(String senderId, String messageText, String updatedAt) {
    if (mounted) {
      setState(() {
        _chat.add(ChatMessage(
          createdAt: updatedAt,
          senderId: senderId,
          text: messageText,
        ));
      });
    }
    _scrollToBottom();
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

  void _handleSend() {
    String trimmedText = _textController.text.trim();

    if (trimmedText.isNotEmpty) {
      _textController.clear();
      _text = '';
      signalRService.invoke("SendMessage",
          [widget.chatId, widget.currentUser.accountId, trimmedText]);
    }
  }

  void _handleKeyPress(String value) {
    String trimmedText = _text.trim(); // Trim leading/trailing whitespace
    if (trimmedText.isNotEmpty) {
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
        backgroundColor: Colors.blue,
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: AssetImage("default-avatar.png"),
            ),
            SizedBox(width: 10),
            Text(
              widget.isSupportChat && widget.currentUser.roleId == "user"
                  ? "Support Agent"
                  : widget.chatUser?.accountName ?? "Unknown",
              style: TextStyle(color: Colors.white),
            ),
          ],
        ),
        actions: [
          if (widget.isSupportChat)
            IconButton(
              icon: Icon(Icons.exit_to_app, color: Colors.white),
              onPressed: _handleExitRoom,
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              color: Color.fromARGB(
                  255, 230, 244, 255), // Changed chat body background color
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
                        color: isOwnMessage
                            ? const Color.fromARGB(255, 193, 227, 255)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: Colors.grey[400]!,
                            width: 0.5), // Added thin border
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            message.text,
                            style: TextStyle(fontSize: 16),
                          ),
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
          ),
          Container(
            color: Colors.white,
            padding: EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(25.0),
                    ),
                    child: TextField(
                      controller: _textController,
                      focusNode: _focusNode,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 20.0, vertical: 10.0),
                      ),
                      onChanged: (value) {
                        setState(() {
                          _text = value;
                        });
                      },
                      onSubmitted: _handleKeyPress,
                      maxLines: null,
                      keyboardType: TextInputType.multiline,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _openEmoji ? Icons.keyboard : Icons.emoji_emotions,
                    color: Colors.blue,
                  ),
                  onPressed: () {
                    setState(() {
                      _openEmoji = !_openEmoji;
                    });
                    if (_openEmoji) {
                      _focusNode.unfocus();
                    } else {
                      Future.delayed(Duration(milliseconds: 100), () {
                        _focusNode.requestFocus();
                      });
                    }
                  },
                ),
                IconButton(
                  icon: Icon(
                    Icons.send,
                    color: Colors.blue,
                  ),
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
                    _textController.text = _textController.text + emoji.emoji;
                  });
                },
                onBackspacePressed: () {
                  if (_textController.selection.baseOffset > 0) {
                    _textController.text = _textController.text.substring(
                            0, _textController.selection.baseOffset - 1) +
                        _textController.text
                            .substring(_textController.selection.baseOffset);
                    _textController.selection = TextSelection.fromPosition(
                        TextPosition(
                            offset: _textController.selection.baseOffset - 1));
                  }
                },
                config: Config(
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
                    bottom: EmojiPickerItem.searchBar,
                  ),
                  skinToneConfig: const SkinToneConfig(),
                  categoryViewConfig: const CategoryViewConfig(),
                  bottomActionBarConfig: const BottomActionBarConfig(),
                  searchViewConfig: const SearchViewConfig(),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
