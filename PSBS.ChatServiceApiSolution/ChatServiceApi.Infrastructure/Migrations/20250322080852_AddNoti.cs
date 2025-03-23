using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ChatServiceApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoti : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationTypes",
                columns: table => new
                {
                    NotiTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotiName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTypes", x => x.NotiTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotiTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificationTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NotificationContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_NotificationTypes_NotiTypeId",
                        column: x => x.NotiTypeId,
                        principalTable: "NotificationTypes",
                        principalColumn: "NotiTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationBox",
                columns: table => new
                {
                    NotiBoxId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationBox", x => x.NotiBoxId);
                    table.ForeignKey(
                        name: "FK_NotificationBox_Notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "Notifications",
                        principalColumn: "NotificationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "NotificationTypes",
                columns: new[] { "NotiTypeId", "NotiName" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Common" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Booking" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Other" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationBox_NotificationId",
                table: "NotificationBox",
                column: "NotificationId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_NotiTypeId",
                table: "Notifications",
                column: "NotiTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationBox");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "NotificationTypes");
        }
    }
}
