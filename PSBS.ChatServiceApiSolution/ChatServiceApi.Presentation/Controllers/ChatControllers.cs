using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatControllers : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatControllers(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// Get chat rooms for a user
        /// </summary>
        [HttpGet("user/{userId}/rooms")]
        public async Task<ActionResult<List<ChatUserDTO>>> GetUserChatRooms(Guid userId)
        {
            var result = await _chatService.GetUserChatRoomsAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get messages from a chat room
        /// </summary>
        [HttpGet("room/{chatRoomId}/messages")]
        public async Task<ActionResult<List<ChatMessage>>> GetChatMessages(Guid chatRoomId, Guid uid)
        {
            var messages = await _chatService.GetChatMessagesAsync(chatRoomId, uid);
            return Ok(messages);
        }

        /// <summary>
        /// Send a message to a chat room
        /// </summary>
        [HttpPost("room/{chatRoomId}/send")]
        public async Task<IActionResult> SendMessage(Guid chatRoomId, [FromBody] SendMessageRequest request)
        {
            await _chatService.SendMessageAsync(chatRoomId, request.SenderId, request.Message);
            return Ok(new { Message = "Message sent successfully" });
        }

        /// <summary>
        /// Create a new chat room
        /// </summary>
        [HttpPost("create")]
        public async Task<ActionResult<Response>> CreateChatRoom([FromBody] CreateChatRoomRequest request)
        {
            var response = await _chatService.CreateChatRoom(request.SenderId, request.ReceiverId);
            return Ok(response);
        }

        /// <summary>
        /// Get participants in a chat room
        /// </summary>
        [HttpGet("room/{chatRoomId}/participants")]
        public async Task<ActionResult<List<Guid>>> GetChatRoomParticipants(Guid chatRoomId)
        {
            var participants = await _chatService.GetChatRoomParticipants(chatRoomId);
            return Ok(participants);
        }
    }

    // DTOs for API requests
    public class SendMessageRequest
    {
        public Guid SenderId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class CreateChatRoomRequest
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
    }
}

