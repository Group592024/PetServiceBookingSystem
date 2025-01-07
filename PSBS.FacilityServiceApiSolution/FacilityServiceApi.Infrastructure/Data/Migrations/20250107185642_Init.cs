using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FacilityServiceApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Camera",
                columns: table => new
                {
                    camera_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    camera_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    camera_code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    camera_status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Camera", x => x.camera_id);
                });

            migrationBuilder.CreateTable(
                name: "RoomType",
                columns: table => new
                {
                    roomType_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    pricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    pricePerDay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomType", x => x.roomType_id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceType",
                columns: table => new
                {
                    serviceType_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    type_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceType", x => x.serviceType_id);
                });

            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    room_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    roomType_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false),
                    room_image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    has_camera = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.room_id);
                    table.ForeignKey(
                        name: "FK_Room_RoomType_roomType_id",
                        column: x => x.roomType_id,
                        principalTable: "RoomType",
                        principalColumn: "roomType_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Service",
                columns: table => new
                {
                    service_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    serviceType_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    service_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    service_Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    service_description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Service", x => x.service_id);
                    table.ForeignKey(
                        name: "FK_Service_ServiceType_serviceType_id",
                        column: x => x.serviceType_id,
                        principalTable: "ServiceType",
                        principalColumn: "serviceType_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomHistories",
                columns: table => new
                {
                    roomHistory_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    pet_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    room_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    booking_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    camera_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    checkin_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    checkout_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomHistories", x => x.roomHistory_id);
                    table.ForeignKey(
                        name: "FK_RoomHistories_Camera_camera_id",
                        column: x => x.camera_id,
                        principalTable: "Camera",
                        principalColumn: "camera_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoomHistories_Room_room_id",
                        column: x => x.room_id,
                        principalTable: "Room",
                        principalColumn: "room_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bookingServiceItems",
                columns: table => new
                {
                    bookingServiceItem_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    booking_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    service_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    pet_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bookingServiceItems", x => x.bookingServiceItem_id);
                    table.ForeignKey(
                        name: "FK_bookingServiceItems_Service_service_id",
                        column: x => x.service_id,
                        principalTable: "Service",
                        principalColumn: "service_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceVariant",
                columns: table => new
                {
                    serviceVariant_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    service_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    service_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    service_content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariant", x => x.serviceVariant_id);
                    table.ForeignKey(
                        name: "FK_ServiceVariant_Service_service_id",
                        column: x => x.service_id,
                        principalTable: "Service",
                        principalColumn: "service_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "RoomType",
                columns: new[] { "roomType_id", "description", "isDeleted", "name", "pricePerDay", "pricePerHour" },
                values: new object[,]
                {
                    { new Guid("58d5fd73-6017-4b8d-b52a-053b49d8c1be"), "Large room for large pets", false, "Large Room", 1000.00m, 120.00m },
                    { new Guid("a6f9a846-212a-4c5a-b39f-bc0ecfef023f"), "Small room for small pets", false, "Small Room", 400.00m, 50.00m },
                    { new Guid("d34d32d7-1e8a-4a55-bef9-8725b084b1b6"), "Medium room for medium-sized pets", false, "Medium Room", 600.00m, 80.00m }
                });

            migrationBuilder.InsertData(
                table: "ServiceType",
                columns: new[] { "serviceType_id", "createAt", "description", "isDeleted", "type_name", "updateAt" },
                values: new object[,]
                {
                    { new Guid("2e9e9b22-81f8-4cda-900c-5e47d0849b67"), new DateTime(2025, 1, 8, 1, 56, 40, 808, DateTimeKind.Local).AddTicks(5024), "Medical services like vaccinations,...", false, "Medical", new DateTime(2025, 1, 8, 1, 56, 40, 808, DateTimeKind.Local).AddTicks(5040) },
                    { new Guid("b94e2e27-fb58-4419-8c4f-69c58b752eab"), new DateTime(2025, 1, 8, 1, 56, 40, 808, DateTimeKind.Local).AddTicks(5043), "Spa services like grooming,...", false, "Spa", new DateTime(2025, 1, 8, 1, 56, 40, 808, DateTimeKind.Local).AddTicks(5043) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_bookingServiceItems_service_id",
                table: "bookingServiceItems",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Room_roomType_id",
                table: "Room",
                column: "roomType_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoomHistories_camera_id",
                table: "RoomHistories",
                column: "camera_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoomHistories_room_id",
                table: "RoomHistories",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Service_serviceType_id",
                table: "Service",
                column: "serviceType_id");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariant_service_id",
                table: "ServiceVariant",
                column: "service_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bookingServiceItems");

            migrationBuilder.DropTable(
                name: "RoomHistories");

            migrationBuilder.DropTable(
                name: "ServiceVariant");

            migrationBuilder.DropTable(
                name: "Camera");

            migrationBuilder.DropTable(
                name: "Room");

            migrationBuilder.DropTable(
                name: "Service");

            migrationBuilder.DropTable(
                name: "RoomType");

            migrationBuilder.DropTable(
                name: "ServiceType");
        }
    }
}
