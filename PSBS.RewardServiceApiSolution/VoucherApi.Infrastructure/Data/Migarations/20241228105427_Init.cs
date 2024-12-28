using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoucherApi.Infrastructure.Data.Migarations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Gifts",
                columns: table => new
                {
                    gift_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    gift_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    gift_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    gift_image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    gift_point = table.Column<int>(type: "int", nullable: false),
                    gift_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    gift_status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gifts", x => x.gift_id);
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    voucher_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    voucher_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    voucher_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    voucher_quantity = table.Column<int>(type: "int", nullable: false),
                    voucher_discount = table.Column<int>(type: "int", nullable: false),
                    voucher_maximum = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    voucher_minimum_spend = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    voucher_code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    voucher_start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    voucher_end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_gift = table.Column<bool>(type: "bit", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vouchers", x => x.voucher_id);
                });

            migrationBuilder.CreateTable(
                name: "RedeemGiftHistories",
                columns: table => new
                {
                    redeemhistory_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    gift_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    account_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    redeem_point = table.Column<int>(type: "int", nullable: false),
                    redeem_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RedeemGiftHistories", x => x.redeemhistory_id);
                    table.ForeignKey(
                        name: "FK_RedeemGiftHistories_Gifts_gift_id",
                        column: x => x.gift_id,
                        principalTable: "Gifts",
                        principalColumn: "gift_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RedeemGiftHistories_gift_id",
                table: "RedeemGiftHistories",
                column: "gift_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RedeemGiftHistories");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "Gifts");
        }
    }
}
