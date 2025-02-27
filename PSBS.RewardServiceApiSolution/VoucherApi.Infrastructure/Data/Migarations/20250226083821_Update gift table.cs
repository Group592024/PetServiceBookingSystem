using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoucherApi.Infrastructure.Data.Migarations
{
    /// <inheritdoc />
    public partial class Updategifttable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "gift_quantity",
                table: "Gifts",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "gift_quantity",
                table: "Gifts",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
