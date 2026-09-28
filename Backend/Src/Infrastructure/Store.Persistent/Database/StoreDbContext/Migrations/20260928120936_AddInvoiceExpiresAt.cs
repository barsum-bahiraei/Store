using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceExpiresAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql(
                """UPDATE "Invoices" SET "ExpiresAt" = "CreatedAt" + interval '12 hours' WHERE "ExpiresAt" IS NULL;""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "Invoices");
        }
    }
}
