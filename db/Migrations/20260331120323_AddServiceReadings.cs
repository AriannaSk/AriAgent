using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceReadings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceReadings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApartmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ResidentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ServiceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Period = table.Column<string>(type: "TEXT", nullable: false),
                    PreviousValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    CurrentValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    Usage = table.Column<decimal>(type: "TEXT", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceReadings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceReadings_Dzivokli_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Dzivokli",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceReadings_Iedzivotaji_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Iedzivotaji",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceReadings_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReadings_ApartmentId",
                table: "ServiceReadings",
                column: "ApartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReadings_ResidentId",
                table: "ServiceReadings",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReadings_ServiceId",
                table: "ServiceReadings",
                column: "ServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceReadings");
        }
    }
}
