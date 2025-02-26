using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoucherApi.Infrastructure.Data.Migarations
{
    /// <inheritdoc />
    public partial class Addgiftquantitycolumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "gift_quantity",
                table: "Gifts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "gift_quantity",
                table: "Gifts");
        }
    }
}
