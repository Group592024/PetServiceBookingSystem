using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatServiceApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBoxes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NotificationBox_Notifications_NotificationId",
                table: "NotificationBox");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NotificationBox",
                table: "NotificationBox");

            migrationBuilder.RenameTable(
                name: "NotificationBox",
                newName: "NotificationBoxes");

            migrationBuilder.RenameIndex(
                name: "IX_NotificationBox_NotificationId",
                table: "NotificationBoxes",
                newName: "IX_NotificationBoxes_NotificationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NotificationBoxes",
                table: "NotificationBoxes",
                column: "NotiBoxId");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationBoxes_Notifications_NotificationId",
                table: "NotificationBoxes",
                column: "NotificationId",
                principalTable: "Notifications",
                principalColumn: "NotificationId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NotificationBoxes_Notifications_NotificationId",
                table: "NotificationBoxes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NotificationBoxes",
                table: "NotificationBoxes");

            migrationBuilder.RenameTable(
                name: "NotificationBoxes",
                newName: "NotificationBox");

            migrationBuilder.RenameIndex(
                name: "IX_NotificationBoxes_NotificationId",
                table: "NotificationBox",
                newName: "IX_NotificationBox_NotificationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NotificationBox",
                table: "NotificationBox",
                column: "NotiBoxId");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationBox_Notifications_NotificationId",
                table: "NotificationBox",
                column: "NotificationId",
                principalTable: "Notifications",
                principalColumn: "NotificationId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
