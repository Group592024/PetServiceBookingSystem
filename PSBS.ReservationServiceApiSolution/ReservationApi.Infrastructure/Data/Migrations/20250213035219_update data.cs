using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ReservationApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class updatedata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "BookingStatuses",
                columns: new[] { "bookingStatus_Id", "bookingStatus_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("050d53c5-c35b-4823-8bc9-a4e70bbdef19"), "Pending", false },
                    { new Guid("20fc00cc-31ad-42bc-a919-45743533f221"), "Completed", false },
                    { new Guid("6994dbd9-afd9-4a25-9075-9704dc6e7690"), "Checked out", false },
                    { new Guid("82126732-4938-41de-ae43-91f6bb013e41"), "Rejected", false },
                    { new Guid("83b1f3fb-0426-4854-b5c3-f7f1b5d046a4"), "Cancelled", false },
                    { new Guid("9133e99e-978a-43f1-a37c-1b0e9e15d369"), "Confirmed", false },
                    { new Guid("ac1c0ebd-0226-4b58-aaa0-244431097a48"), "Checked in", false },
                    { new Guid("bdbecd97-9f44-45ed-9dcc-b60e50ff8141"), "Processing", false },
                    { new Guid("e669fb8d-ff35-4978-a756-d8ad546ebc84"), "Refunded", false }
                });

            migrationBuilder.InsertData(
                table: "BookingTypes",
                columns: new[] { "bookingType_Id", "bookingTpye_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("c778bfec-6790-41d7-8cb4-fe5c61afe4b0"), "Hotel", false },
                    { new Guid("fbc2bb15-77f2-4216-a25e-070992b3ea56"), "Service", false }
                });

            migrationBuilder.InsertData(
                table: "PaymentTypes",
                columns: new[] { "paymentType_Id", "paymentType_name", "isDeleted" },
                values: new object[,]
                {
                    { new Guid("01b6b105-480a-46d3-bdf5-78a6078b33a7"), "COD", false },
                    { new Guid("dd2346de-20e4-4f95-a130-4dd3cac618f1"), "VNPay", false }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("050d53c5-c35b-4823-8bc9-a4e70bbdef19"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("20fc00cc-31ad-42bc-a919-45743533f221"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("6994dbd9-afd9-4a25-9075-9704dc6e7690"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("82126732-4938-41de-ae43-91f6bb013e41"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("83b1f3fb-0426-4854-b5c3-f7f1b5d046a4"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("9133e99e-978a-43f1-a37c-1b0e9e15d369"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("ac1c0ebd-0226-4b58-aaa0-244431097a48"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("bdbecd97-9f44-45ed-9dcc-b60e50ff8141"));

            migrationBuilder.DeleteData(
                table: "BookingStatuses",
                keyColumn: "bookingStatus_Id",
                keyValue: new Guid("e669fb8d-ff35-4978-a756-d8ad546ebc84"));

            migrationBuilder.DeleteData(
                table: "BookingTypes",
                keyColumn: "bookingType_Id",
                keyValue: new Guid("c778bfec-6790-41d7-8cb4-fe5c61afe4b0"));

            migrationBuilder.DeleteData(
                table: "BookingTypes",
                keyColumn: "bookingType_Id",
                keyValue: new Guid("fbc2bb15-77f2-4216-a25e-070992b3ea56"));

            migrationBuilder.DeleteData(
                table: "PaymentTypes",
                keyColumn: "paymentType_Id",
                keyValue: new Guid("01b6b105-480a-46d3-bdf5-78a6078b33a7"));

            migrationBuilder.DeleteData(
                table: "PaymentTypes",
                keyColumn: "paymentType_Id",
                keyValue: new Guid("dd2346de-20e4-4f95-a130-4dd3cac618f1"));
        }
    }
}
