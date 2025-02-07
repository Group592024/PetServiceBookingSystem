using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FacilityServiceApi.Infrastructure.Data
{
    /// <inheritdoc />
    public partial class second : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 5, 0, 12, 59, 622, DateTimeKind.Local).AddTicks(5582), new DateTime(2025, 2, 5, 0, 12, 59, 622, DateTimeKind.Local).AddTicks(5597) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 5, 0, 12, 59, 622, DateTimeKind.Local).AddTicks(5601), new DateTime(2025, 2, 5, 0, 12, 59, 622, DateTimeKind.Local).AddTicks(5602) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 1, 19, 16, 16, 13, 704, DateTimeKind.Local).AddTicks(5602), new DateTime(2025, 1, 19, 16, 16, 13, 704, DateTimeKind.Local).AddTicks(5613) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 1, 19, 16, 16, 13, 704, DateTimeKind.Local).AddTicks(5615), new DateTime(2025, 1, 19, 16, 16, 13, 704, DateTimeKind.Local).AddTicks(5616) });
        }
    }
}
