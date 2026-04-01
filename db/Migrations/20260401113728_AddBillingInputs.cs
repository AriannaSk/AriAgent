using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingInputs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingInputs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApartmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Period = table.Column<string>(type: "TEXT", nullable: false),
                    WaterM3 = table.Column<decimal>(type: "TEXT", nullable: false),
                    ElectricityKwh = table.Column<decimal>(type: "TEXT", nullable: false),
                    ResidentsCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingInputs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingInputs_Dzivokli_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Dzivokli",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingInputs_ApartmentId",
                table: "BillingInputs",
                column: "ApartmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillingInputs");
        }
    }
}
