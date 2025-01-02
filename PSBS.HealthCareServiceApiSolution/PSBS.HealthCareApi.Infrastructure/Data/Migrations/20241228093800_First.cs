using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSBS.HealthCareApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class First : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Treatment",
                columns: table => new
                {
                    treatment_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
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
                    medicine_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
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
                name: "PetHealthBook",
                columns: table => new
                {
                    healthBook_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    booking_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    medicine_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    table.ForeignKey(
                        name: "FK_PetHealthBook_Medicine_medicine_id",
                        column: x => x.medicine_id,
                        principalTable: "Medicine",
                        principalColumn: "medicine_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_treatment_id",
                table: "Medicine",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_PetHealthBook_medicine_id",
                table: "PetHealthBook",
                column: "medicine_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PetHealthBook");

            migrationBuilder.DropTable(
                name: "Medicine");

            migrationBuilder.DropTable(
                name: "Treatment");
        }
    }
}
