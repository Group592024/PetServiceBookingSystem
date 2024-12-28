using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FacilityServiceApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class migration1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Camera",
                columns: table => new
                {
                    cameraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    cameraType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    cameraCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    cameraStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Camera", x => x.cameraId);
                });

            migrationBuilder.CreateTable(
                name: "RoomType",
                columns: table => new
                {
                    roomTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    pricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    pricePerDay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomType", x => x.roomTypeId);
                });

            migrationBuilder.CreateTable(
                name: "ServiceType",
                columns: table => new
                {
                    serviceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    typeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceType", x => x.serviceTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    roomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    roomTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false),
                    roomImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    hasCamera = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.roomId);
                    table.ForeignKey(
                        name: "FK_Room_RoomType_roomTypeId",
                        column: x => x.roomTypeId,
                        principalTable: "RoomType",
                        principalColumn: "roomTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Service",
                columns: table => new
                {
                    serviceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    serviceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    serviceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    serviceImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    serviceDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Service", x => x.serviceId);
                    table.ForeignKey(
                        name: "FK_Service_ServiceType_serviceTypeId",
                        column: x => x.serviceTypeId,
                        principalTable: "ServiceType",
                        principalColumn: "serviceTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceVariant",
                columns: table => new
                {
                    serviceVariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    serviceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    servicePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    serviceContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariant", x => x.serviceVariantId);
                    table.ForeignKey(
                        name: "FK_ServiceVariant_Service_serviceId",
                        column: x => x.serviceId,
                        principalTable: "Service",
                        principalColumn: "serviceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "RoomType",
                columns: new[] { "roomTypeId", "description", "isDeleted", "name", "pricePerDay", "pricePerHour" },
                values: new object[,]
                {
                    { new Guid("58d5fd73-6017-4b8d-b52a-053b49d8c1be"), "Large room for large pets", false, "Large Room", 1000.00m, 120.00m },
                    { new Guid("a6f9a846-212a-4c5a-b39f-bc0ecfef023f"), "Small room for small pets", false, "Small Room", 400.00m, 50.00m },
                    { new Guid("d34d32d7-1e8a-4a55-bef9-8725b084b1b6"), "Medium room for medium-sized pets", false, "Medium Room", 600.00m, 80.00m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Room_roomTypeId",
                table: "Room",
                column: "roomTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Service_serviceTypeId",
                table: "Service",
                column: "serviceTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariant_serviceId",
                table: "ServiceVariant",
                column: "serviceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Camera");

            migrationBuilder.DropTable(
                name: "Room");

            migrationBuilder.DropTable(
                name: "ServiceVariant");

            migrationBuilder.DropTable(
                name: "RoomType");

            migrationBuilder.DropTable(
                name: "Service");

            migrationBuilder.DropTable(
                name: "ServiceType");
        }
    }
}
