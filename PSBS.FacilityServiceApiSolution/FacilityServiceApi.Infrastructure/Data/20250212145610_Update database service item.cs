using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FacilityServiceApi.Infrastructure.Data
{
    /// <inheritdoc />
    public partial class Updatedatabaseserviceitem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "booking_Date",
                table: "bookingServiceItems");

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 21, 56, 9, 281, DateTimeKind.Local).AddTicks(2006), new DateTime(2025, 2, 12, 21, 56, 9, 281, DateTimeKind.Local).AddTicks(2020) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 21, 56, 9, 281, DateTimeKind.Local).AddTicks(2023), new DateTime(2025, 2, 12, 21, 56, 9, 281, DateTimeKind.Local).AddTicks(2024) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "booking_Date",
                table: "bookingServiceItems",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 11, 28, 18, 27, DateTimeKind.Local).AddTicks(6713), new DateTime(2025, 2, 12, 11, 28, 18, 27, DateTimeKind.Local).AddTicks(6773) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 11, 28, 18, 27, DateTimeKind.Local).AddTicks(6781), new DateTime(2025, 2, 12, 11, 28, 18, 27, DateTimeKind.Local).AddTicks(6782) });
        }
    }
}
