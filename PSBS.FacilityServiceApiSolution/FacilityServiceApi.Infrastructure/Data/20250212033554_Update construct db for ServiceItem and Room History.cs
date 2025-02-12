using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FacilityServiceApi.Infrastructure.Data
{
    /// <inheritdoc />
    public partial class UpdateconstructdbforServiceItemandRoomHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomHistories_Camera_camera_id",
                table: "RoomHistories");

            migrationBuilder.AlterColumn<Guid>(
                name: "camera_id",
                table: "RoomHistories",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<bool>(
                name: "booking_camera",
                table: "RoomHistories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "booking_end_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "booking_start_date",
                table: "RoomHistories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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
                values: new object[] { new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1611), new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1628) });

            migrationBuilder.UpdateData(
                table: "ServiceType",
                keyColumn: "serviceType_id",
                keyValue: new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                columns: new[] { "createAt", "updateAt" },
                values: new object[] { new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1631), new DateTime(2025, 2, 12, 10, 35, 53, 594, DateTimeKind.Local).AddTicks(1632) });

            migrationBuilder.AddForeignKey(
                name: "FK_RoomHistories_Camera_camera_id",
                table: "RoomHistories",
                column: "camera_id",
                principalTable: "Camera",
                principalColumn: "camera_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomHistories_Camera_camera_id",
                table: "RoomHistories");

            migrationBuilder.DropColumn(
                name: "booking_camera",
                table: "RoomHistories");

            migrationBuilder.DropColumn(
                name: "booking_end_date",
                table: "RoomHistories");

            migrationBuilder.DropColumn(
                name: "booking_start_date",
                table: "RoomHistories");

            migrationBuilder.DropColumn(
                name: "booking_Date",
                table: "bookingServiceItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "camera_id",
                table: "RoomHistories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_RoomHistories_Camera_camera_id",
                table: "RoomHistories",
                column: "camera_id",
                principalTable: "Camera",
                principalColumn: "camera_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
