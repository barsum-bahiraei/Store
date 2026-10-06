using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class RefactorDiscountCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPercent",
                table: "DiscountCodes");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "DiscountCodes");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "DiscountCodes",
                newName: "ExpireAt");

            migrationBuilder.Sql(
                """UPDATE "DiscountCodes" SET "MaxDiscountAmount" = 0 WHERE "MaxDiscountAmount" IS NULL;""");

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxDiscountAmount",
                table: "DiscountCodes",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumPurchaseAmount",
                table: "DiscountCodes",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinimumPurchaseAmount",
                table: "DiscountCodes");

            migrationBuilder.RenameColumn(
                name: "ExpireAt",
                table: "DiscountCodes",
                newName: "EndDate");

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxDiscountAmount",
                table: "DiscountCodes",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercent",
                table: "DiscountCodes",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "DiscountCodes",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
