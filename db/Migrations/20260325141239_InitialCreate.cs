using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Leaseholds_LeaseholdId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_InvoiceIdentifier",
                table: "Invoices");

            migrationBuilder.AlterColumn<decimal>(
                name: "Total",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AlterColumn<Guid>(
                name: "LeaseholdId",
                table: "Invoices",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "TEXT");

            migrationBuilder.AddColumn<Guid>(
                name: "ApartmentId",
                table: "Invoices",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ApartmentId",
                table: "Invoices",
                column: "ApartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Dzivokli_ApartmentId",
                table: "Invoices",
                column: "ApartmentId",
                principalTable: "Dzivokli",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Leaseholds_LeaseholdId",
                table: "Invoices",
                column: "LeaseholdId",
                principalTable: "Leaseholds",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Dzivokli_ApartmentId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Leaseholds_LeaseholdId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_ApartmentId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ApartmentId",
                table: "Invoices");

            migrationBuilder.AlterColumn<decimal>(
                name: "Total",
                table: "Invoices",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<Guid>(
                name: "LeaseholdId",
                table: "Invoices",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceIdentifier",
                table: "Invoices",
                column: "InvoiceIdentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Leaseholds_LeaseholdId",
                table: "Invoices",
                column: "LeaseholdId",
                principalTable: "Leaseholds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
