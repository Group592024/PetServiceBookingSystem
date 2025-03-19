using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PetTypes",
                columns: table => new
                {
                    PetType_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PetType_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PetType_Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PetType_Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetTypes", x => x.PetType_ID);
                });

            migrationBuilder.CreateTable(
                name: "PetBreeds",
                columns: table => new
                {
                    PetBreed_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PetBreed_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PetBreed_Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PetBreed_Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    PetType_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetBreeds", x => x.PetBreed_ID);
                    table.ForeignKey(
                        name: "FK_PetBreeds_PetTypes_PetType_ID",
                        column: x => x.PetType_ID,
                        principalTable: "PetTypes",
                        principalColumn: "PetType_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pets",
                columns: table => new
                {
                    Pet_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Pet_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pet_Gender = table.Column<bool>(type: "bit", nullable: false),
                    Pet_Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pet_Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date_Of_Birth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Pet_Weight = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pet_FurType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pet_FurColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    PetBreed_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Account_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pets", x => x.Pet_ID);
                    table.ForeignKey(
                        name: "FK_Pets_PetBreeds_PetBreed_ID",
                        column: x => x.PetBreed_ID,
                        principalTable: "PetBreeds",
                        principalColumn: "PetBreed_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PetDiarys",
                columns: table => new
                {
                    Diary_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Diary_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Diary_Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pet_ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetDiarys", x => x.Diary_ID);
                    table.ForeignKey(
                        name: "FK_PetDiarys_Pets_Pet_ID",
                        column: x => x.Pet_ID,
                        principalTable: "Pets",
                        principalColumn: "Pet_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PetBreeds_PetType_ID",
                table: "PetBreeds",
                column: "PetType_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PetDiarys_Pet_ID",
                table: "PetDiarys",
                column: "Pet_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Pets_PetBreed_ID",
                table: "Pets",
                column: "PetBreed_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PetDiarys");

            migrationBuilder.DropTable(
                name: "Pets");

            migrationBuilder.DropTable(
                name: "PetBreeds");

            migrationBuilder.DropTable(
                name: "PetTypes");
        }
    }
}
