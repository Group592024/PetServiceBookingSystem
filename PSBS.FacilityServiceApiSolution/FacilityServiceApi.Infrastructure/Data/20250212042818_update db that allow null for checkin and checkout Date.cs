using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FacilityServiceApi.Infrastructure.Data
{
    /// <inheritdoc />
    public partial class updatedbthatallownullforcheckinandcheckoutDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "checkout_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "checkin_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "checkout_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "checkin_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1611), new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1628) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1631), new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1632) });
        }
    }
}
