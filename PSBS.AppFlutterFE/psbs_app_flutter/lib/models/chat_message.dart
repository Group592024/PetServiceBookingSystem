// chat_message.dart
class ChatMessage {
  final String name;
  final String createdAt;
  final String senderId;
  final String text;
  final String? chatMessageId;

  ChatMessage({
    required this.name,
    required this.createdAt,
    required this.senderId,
    required this.text,
    this.chatMessageId,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      chatMessageId: json['chatMessageId']?.toString(),
      name: json['name']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chatMessageId': chatMessageId,
      'name': name,
      'createdAt': createdAt,
      'senderId': senderId,
      'text': text,
    };
  }
}
