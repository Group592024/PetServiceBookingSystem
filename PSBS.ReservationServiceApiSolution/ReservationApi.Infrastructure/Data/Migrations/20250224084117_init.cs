using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ReservationApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookingStatuses",
                columns: table => new
                {
                    bookingStatus_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    bookingStatus_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingStatuses", x => x.bookingStatus_Id);
                });

            migrationBuilder.CreateTable(
                name: "BookingTypes",
                columns: table => new
                {
                    bookingType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    bookingTpye_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingTypes", x => x.bookingType_Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentTypes",
                columns: table => new
                {
                    paymentType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    paymentType_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTypes", x => x.paymentType_Id);
                });

            migrationBuilder.CreateTable(
                name: "PointRules",
                columns: table => new
                {
                    pointRule_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    pointRuleRatio = table.Column<int>(type: "int", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointRules", x => x.pointRule_Id);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    booking_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    booking_Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    account_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    bookingStatus_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    paymentType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    voucher_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    bookingType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    pointRule_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    totalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    bookingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    isPaid = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.booking_Id);
                    table.ForeignKey(
                        name: "FK_Bookings_BookingStatuses_bookingStatus_Id",
                        column: x => x.bookingStatus_Id,
                        principalTable: "BookingStatuses",
                        principalColumn: "bookingStatus_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_BookingTypes_bookingType_Id",
                        column: x => x.bookingType_Id,
                        principalTable: "BookingTypes",
                        principalColumn: "bookingType_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_PaymentTypes_paymentType_Id",
                        column: x => x.paymentType_Id,
                        principalTable: "PaymentTypes",
                        principalColumn: "paymentType_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_PointRules_pointRule_Id",
                        column: x => x.pointRule_Id,
                        principalTable: "PointRules",
                        principalColumn: "pointRule_Id");
                });

            migrationBuilder.InsertData(
                table: "BookingStatuses",
                columns: new[] { "bookingStatus_Id", "bookingStatus_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("43bd1908-269d-4c36-9331-2f5bd3f122e6"), "Processing", false },
                    { new Guid("7715b1e9-db4d-4c94-a473-244d80ce3967"), "Checked out", false },
                    { new Guid("7a4d1ad4-93d5-4bb6-86d7-c9f144b3c483"), "Rejected", false },
                    { new Guid("869e1f2b-720b-4918-af38-0774bc5dd801"), "Completed", false },
                    { new Guid("8aa86749-70e9-450d-a07d-cddf99a6b907"), "Confirmed", false },
                    { new Guid("b4e31140-5821-4cb5-91e4-e7e37447c149"), "Pending", false },
                    { new Guid("c4810046-d3cd-4605-b6e4-7a19467289aa"), "Refunded", false },
                    { new Guid("d61d1d84-677c-44d9-a3ca-27f12b4700ab"), "Checked in", false },
                    { new Guid("dd58afa1-9a28-48d7-8e0a-f8f57673e414"), "Cancelled", false }
                });

            migrationBuilder.InsertData(
                table: "BookingTypes",
                columns: new[] { "bookingType_Id", "bookingTpye_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("4d6bda18-8229-4696-9783-9c1f6563da77"), "Hotel", false },
                    { new Guid("bcbff413-9722-47f2-8f89-3f57e4b966fd"), "Service", false }
                });

            migrationBuilder.InsertData(
                table: "PaymentTypes",
                columns: new[] { "paymentType_Id", "paymentType_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("7780685e-084f-481d-8aa2-11e1cb73b1fa"), "COD", false },
                    { new Guid("d822f0fb-a4a5-42b3-a26a-5df67754f782"), "VNPay", false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_bookingStatus_Id",
                table: "Bookings",
                column: "bookingStatus_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_bookingType_Id",
                table: "Bookings",
                column: "bookingType_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_paymentType_Id",
                table: "Bookings",
                column: "paymentType_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_pointRule_Id",
                table: "Bookings",
                column: "pointRule_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "BookingStatuses");

            migrationBuilder.DropTable(
                name: "BookingTypes");

            migrationBuilder.DropTable(
                name: "PaymentTypes");

            migrationBuilder.DropTable(
                name: "PointRules");
        }
    }
}
