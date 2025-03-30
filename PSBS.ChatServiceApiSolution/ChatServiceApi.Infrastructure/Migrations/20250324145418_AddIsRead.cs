using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatServiceApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsRead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "NotificationBoxes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "NotificationBoxes");
        }
    }
}
