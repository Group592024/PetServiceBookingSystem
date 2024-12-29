using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PSPS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class First : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountGuId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountPassword = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountGender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountDob = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountLoyaltyPoint = table.Column<int>(type: "int", nullable: false),
                    AccountIsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.AccountGuId);
                    table.ForeignKey(
                        name: "FK_Accounts_Role_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_RoleId",
                table: "Accounts",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
