using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSBS.HealthCareApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class _001 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PetHealthBook",
                columns: table => new
                {
                    healthBook_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingServiceItem_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    medicine_Ids = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    visit_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    nextvisit_Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    perform_By = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetHealthBook", x => x.healthBook_Id);
                });

            migrationBuilder.CreateTable(
                name: "Treatment",
                columns: table => new
                {
                    treatment_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    treatment_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Treatment", x => x.treatment_Id);
                });

            migrationBuilder.CreateTable(
                name: "Medicine",
                columns: table => new
                {
                    medicine_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    treatment_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    medicine_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    medicine_image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicine", x => x.medicine_id);
                    table.ForeignKey(
                        name: "FK_Medicine_Treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "Treatment",
                        principalColumn: "treatment_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PetHealthBookMedicine",
                columns: table => new
                {
                    healthBookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    medicineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetHealthBookMedicine", x => new { x.healthBookId, x.medicineId });
                    table.ForeignKey(
                        name: "FK_PetHealthBookMedicine_Medicine_medicineId",
                        column: x => x.medicineId,
                        principalTable: "Medicine",
                        principalColumn: "medicine_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PetHealthBookMedicine_PetHealthBook_healthBookId",
                        column: x => x.healthBookId,
                        principalTable: "PetHealthBook",
                        principalColumn: "healthBook_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_treatment_id",
                table: "Medicine",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_PetHealthBookMedicine_medicineId",
                table: "PetHealthBookMedicine",
                column: "medicineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PetHealthBookMedicine");

            migrationBuilder.DropTable(
                name: "Medicine");

            migrationBuilder.DropTable(
                name: "PetHealthBook");

            migrationBuilder.DropTable(
                name: "Treatment");
        }
    }
}
