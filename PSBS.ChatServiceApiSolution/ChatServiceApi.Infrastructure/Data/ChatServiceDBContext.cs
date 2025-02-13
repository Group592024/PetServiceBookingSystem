

using ChatServiceApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChatServiceApi.Infrastructure.Data
{
    public class ChatServiceDBContext(DbContextOptions<ChatServiceDBContext> options) : DbContext(options)
    {
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<RoomParticipant> RoomParticipants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChatMessage>()
                   .HasOne(p => p.ChatRoom)
                   .WithMany(p => p.ChatMessages)
                   .HasForeignKey(p => p.ChatRoomId);

            modelBuilder.Entity<RoomParticipant>()
                .HasOne(p => p.ChatRoom)
                .WithMany(p => p.Participants)
                .HasForeignKey(p => p.ChatRoomId);
        }
    }
}
