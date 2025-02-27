// chat_message.dart
class ChatMessage {
  final String createdAt;
  final String senderId;
  final String text;
  final String? chatMessageId;

  ChatMessage({
    required this.createdAt,
    required this.senderId,
    required this.text,
    this.chatMessageId,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      chatMessageId: json['chatMessageId']?.toString(),
      createdAt: json['createdAt']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chatMessageId': chatMessageId,
      'createdAt': createdAt,
      'senderId': senderId,
      'text': text,
    };
  }
}
