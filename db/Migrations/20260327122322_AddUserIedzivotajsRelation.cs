using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIedzivotajsRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IedzivotajsId",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_IedzivotajsId",
                table: "Users",
                column: "IedzivotajsId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Iedzivotaji_IedzivotajsId",
                table: "Users",
                column: "IedzivotajsId",
                principalTable: "Iedzivotaji",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Iedzivotaji_IedzivotajsId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_IedzivotajsId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IedzivotajsId",
                table: "Users");
        }
    }
}
