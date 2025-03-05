using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VoucherApi.Infrastructure.Migrations
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
                    gift_status = table.Column<bool>(type: "bit", nullable: false),
                    gift_quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gifts", x => x.gift_id);
                });

            migrationBuilder.CreateTable(
                name: "RedeemStatuses",
                columns: table => new
                {
                    redeem_status_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    redeem_status_name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RedeemStatuses", x => x.redeem_status_id);
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
                    gift_status_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    table.ForeignKey(
                        name: "FK_RedeemGiftHistories_RedeemStatuses_gift_status_id",
                        column: x => x.gift_status_id,
                        principalTable: "RedeemStatuses",
                        principalColumn: "redeem_status_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "RedeemStatuses",
                columns: new[] { "redeem_status_id", "redeem_status_name" },
                values: new object[,]
                {
                    { new Guid("1509e4e6-e1ec-42a4-9301-05131dd498e4"), "Just Redeemed" },
                    { new Guid("33b84495-c2a6-4b3e-98ca-f13d9c150946"), "Picked up at Store" },
                    { new Guid("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"), "Canceled Redeem" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_RedeemGiftHistories_gift_id",
                table: "RedeemGiftHistories",
                column: "gift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RedeemGiftHistories_gift_status_id",
                table: "RedeemGiftHistories",
                column: "gift_status_id");
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

            migrationBuilder.DropTable(
                name: "RedeemStatuses");
        }
    }
}
