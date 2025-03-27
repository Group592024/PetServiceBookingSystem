

using ChatServiceApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChatServiceApi.Infrastructure.Data
{
    public class ChatServiceDBContext(DbContextOptions<ChatServiceDBContext> options) : DbContext(options)
    {
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<RoomParticipant> RoomParticipants { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationType> NotificationTypes { get; set; }
        public DbSet<NotificationBox> NotificationBoxes { get; set; }



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

            modelBuilder.Entity<Notification>()
               .HasOne(p => p.NotificationType)
               .WithMany(p => p.Notifications)
               .HasForeignKey(p => p.NotiTypeId);

            modelBuilder.Entity<NotificationBox>()
               .HasOne(p => p.Notification)
               .WithMany(p => p.NotificationBoxes)
               .HasForeignKey(p => p.NotificationId);


            // Seed data for NotificationType
            modelBuilder.Entity<NotificationType>().HasData(
                new NotificationType { NotiTypeId = Guid.Parse("11111111-1111-1111-1111-111111111111"), NotiName = "Common" },
                new NotificationType { NotiTypeId = Guid.Parse("22222222-2222-2222-2222-222222222222"), NotiName = "Booking" },
                new NotificationType { NotiTypeId = Guid.Parse("33333333-3333-3333-3333-333333333333"), NotiName = "Other" }
            );
        }
    }
}
