using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantModelAndOptionalSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductVariantAttributeValues_ProductVariantId_Size",
                table: "ProductVariantAttributeValues");

            migrationBuilder.AlterColumn<string>(
                name: "Size",
                table: "ProductVariantAttributeValues",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "ProductVariantAttributeValues",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributeValues_ProductVariantId_Size_Model_C~",
                table: "ProductVariantAttributeValues",
                columns: new[] { "ProductVariantId", "Size", "Model", "ColorName", "ColorCode" },
                unique: true)
                .Annotation("Npgsql:NullsDistinct", false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductVariantAttributeValues_ProductVariantId_Size_Model_C~",
                table: "ProductVariantAttributeValues");

            migrationBuilder.Sql("""
                WITH "AffectedVariants" AS (
                    SELECT DISTINCT "ProductVariantId"
                    FROM "ProductVariantAttributeValues"
                    WHERE "Size" IS NULL
                    UNION
                    SELECT "ProductVariantId"
                    FROM "ProductVariantAttributeValues"
                    GROUP BY "ProductVariantId", "Size"
                    HAVING COUNT(*) > 1
                )
                UPDATE "ProductVariantAttributeValues" AS value
                SET "Size" = value."Id"::text || '-' || LEFT(COALESCE(value."Size", 'legacy'), 39)
                WHERE value."ProductVariantId" IN (SELECT "ProductVariantId" FROM "AffectedVariants");
                """);

            migrationBuilder.DropColumn(
                name: "Model",
                table: "ProductVariantAttributeValues");

            migrationBuilder.AlterColumn<string>(
                name: "Size",
                table: "ProductVariantAttributeValues",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantAttributeValues_ProductVariantId_Size",
                table: "ProductVariantAttributeValues",
                columns: new[] { "ProductVariantId", "Size" },
                unique: true);
        }
    }
}
