using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservationApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddbookingCodecolumntoBookingtable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "booking_Code",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "booking_Code",
                table: "Bookings");
        }
    }
}
