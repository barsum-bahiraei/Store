using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class MakeVariantColorOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ColorName",
                table: "ProductVariantAttributeValues",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "ColorCode",
                table: "ProductVariantAttributeValues",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "ProductVariantAttributeValues"
                SET "ColorName" = COALESCE("ColorName", ''),
                    "ColorCode" = COALESCE("ColorCode", '');
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ColorName",
                table: "ProductVariantAttributeValues",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ColorCode",
                table: "ProductVariantAttributeValues",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true);
        }
    }
}
