using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservationApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
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
                    account_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    bookingStatus_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    paymentType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    voucher_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    bookingType_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    pointRule_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    totalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    bookingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        principalColumn: "pointRule_Id",
                        onDelete: ReferentialAction.Cascade);
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
