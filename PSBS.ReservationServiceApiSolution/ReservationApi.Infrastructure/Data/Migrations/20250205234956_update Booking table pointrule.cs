using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservationApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateBookingtablepointrule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_PointRules_pointRule_Id",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "pointRule_Id",
                table: "Bookings",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_PointRules_pointRule_Id",
                table: "Bookings",
                column: "pointRule_Id",
                principalTable: "PointRules",
                principalColumn: "pointRule_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_PointRules_pointRule_Id",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "pointRule_Id",
                table: "Bookings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_PointRules_pointRule_Id",
                table: "Bookings",
                column: "pointRule_Id",
                principalTable: "PointRules",
                principalColumn: "pointRule_Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
