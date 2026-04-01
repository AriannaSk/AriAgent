using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db.Migrations
{
    /// <inheritdoc />
    public partial class ResetDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Iedzivotaji",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Vards = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Uzvards = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    PersonasKods = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Telefons = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Epasts = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsOwner = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Iedzivotaji", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Majas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Numurs = table.Column<int>(type: "INTEGER", nullable: false),
                    Iela = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Pilseta = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Valsts = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    PastaIndekss = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Majas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Password = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Dzivokli",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Numurs = table.Column<int>(type: "INTEGER", nullable: false),
                    Stavs = table.Column<int>(type: "INTEGER", nullable: false),
                    IstabuSkaits = table.Column<int>(type: "INTEGER", nullable: false),
                    IedzivotajuSkaits = table.Column<int>(type: "INTEGER", nullable: false),
                    PilnaPlatiba = table.Column<double>(type: "REAL", nullable: false),
                    DzivojamaPlatiba = table.Column<double>(type: "REAL", nullable: false),
                    MajaId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dzivokli", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dzivokli_Majas_MajaId",
                        column: x => x.MajaId,
                        principalTable: "Majas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DzivoklisIedzivotajs",
                columns: table => new
                {
                    DzivokliId = table.Column<Guid>(type: "TEXT", nullable: false),
                    IedzivotajiId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DzivoklisIedzivotajs", x => new { x.DzivokliId, x.IedzivotajiId });
                    table.ForeignKey(
                        name: "FK_DzivoklisIedzivotajs_Dzivokli_DzivokliId",
                        column: x => x.DzivokliId,
                        principalTable: "Dzivokli",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DzivoklisIedzivotajs_Iedzivotaji_IedzivotajiId",
                        column: x => x.IedzivotajiId,
                        principalTable: "Iedzivotaji",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Leaseholds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApartmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MajaId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leaseholds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leaseholds_Dzivokli_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Dzivokli",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Leaseholds_Majas_MajaId",
                        column: x => x.MajaId,
                        principalTable: "Majas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    InvoiceIdentifier = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Period = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    LeaseholdId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Leaseholds_LeaseholdId",
                        column: x => x.LeaseholdId,
                        principalTable: "Leaseholds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nosaukums = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Tarifs = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Nodoklis = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Formula = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    LeaseholdId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_Leaseholds_LeaseholdId",
                        column: x => x.LeaseholdId,
                        principalTable: "Leaseholds",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "InvoiceService",
                columns: table => new
                {
                    InvoicesId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ServicesId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceService", x => new { x.InvoicesId, x.ServicesId });
                    table.ForeignKey(
                        name: "FK_InvoiceService_Invoices_InvoicesId",
                        column: x => x.InvoicesId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceService_Services_ServicesId",
                        column: x => x.ServicesId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dzivokli_MajaId",
                table: "Dzivokli",
                column: "MajaId");

            migrationBuilder.CreateIndex(
                name: "IX_DzivoklisIedzivotajs_IedzivotajiId",
                table: "DzivoklisIedzivotajs",
                column: "IedzivotajiId");

            migrationBuilder.CreateIndex(
                name: "IX_Iedzivotaji_PersonasKods",
                table: "Iedzivotaji",
                column: "PersonasKods",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceIdentifier",
                table: "Invoices",
                column: "InvoiceIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_LeaseholdId",
                table: "Invoices",
                column: "LeaseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceService_ServicesId",
                table: "InvoiceService",
                column: "ServicesId");

            migrationBuilder.CreateIndex(
                name: "IX_Leaseholds_ApartmentId",
                table: "Leaseholds",
                column: "ApartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Leaseholds_MajaId",
                table: "Leaseholds",
                column: "MajaId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_LeaseholdId",
                table: "Services",
                column: "LeaseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Nosaukums",
                table: "Services",
                column: "Nosaukums");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DzivoklisIedzivotajs");

            migrationBuilder.DropTable(
                name: "InvoiceService");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Iedzivotaji");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Leaseholds");

            migrationBuilder.DropTable(
                name: "Dzivokli");

            migrationBuilder.DropTable(
                name: "Majas");
        }
    }
}
