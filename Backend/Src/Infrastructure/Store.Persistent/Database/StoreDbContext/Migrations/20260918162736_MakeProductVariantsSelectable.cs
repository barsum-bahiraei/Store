using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class MakeProductVariantsSelectable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants");

            migrationBuilder.CreateTable(
                name: "ProductsVariants",
                columns: table => new
                {
                    ProductVariantsId = table.Column<int>(type: "integer", nullable: false),
                    ProductsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductsVariants", x => new { x.ProductVariantsId, x.ProductsId });
                    table.ForeignKey(
                        name: "FK_ProductsVariants_ProductVariants_ProductVariantsId",
                        column: x => x.ProductVariantsId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductsVariants_Products_ProductsId",
                        column: x => x.ProductsId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductsVariants_ProductsId",
                table: "ProductsVariants",
                column: "ProductsId");

            migrationBuilder.Sql("""
                INSERT INTO "ProductsVariants" ("ProductVariantsId", "ProductsId")
                SELECT "Id", "ProductId" FROM "ProductVariants";
                """);

            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "ProductVariants");

            migrationBuilder.Sql("""
                INSERT INTO "RoleAccess" ("ControllerName", "ActionName", "RoleId", "CreatedAt", "UpdatedAt")
                SELECT 'Product', action."Name", role."Id", NOW(), NOW()
                FROM "Roles" AS role
                CROSS JOIN (VALUES
                    ('BrandPost'),
                    ('BrandPut'),
                    ('BrandDelete'),
                    ('VariantPost'),
                    ('VariantPut'),
                    ('VariantDelete')
                ) AS action("Name")
                WHERE role."Name" = 'Owner'
                  AND NOT EXISTS (
                      SELECT 1 FROM "RoleAccess" AS access
                      WHERE access."RoleId" = role."Id"
                        AND access."ControllerName" = 'Product'
                        AND access."ActionName" = action."Name"
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "RoleAccess"
                WHERE "ControllerName" = 'Product'
                  AND "ActionName" IN (
                      'BrandPost', 'BrandPut', 'BrandDelete',
                      'VariantPost', 'VariantPut', 'VariantDelete'
                  )
                  AND "RoleId" IN (SELECT "Id" FROM "Roles" WHERE "Name" = 'Owner');
                """);

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "ProductVariants",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "ProductVariants" AS variant
                SET "ProductId" = relation."ProductsId"
                FROM (
                    SELECT "ProductVariantsId", MIN("ProductsId") AS "ProductsId"
                    FROM "ProductsVariants"
                    GROUP BY "ProductVariantsId"
                ) AS relation
                WHERE variant."Id" = relation."ProductVariantsId";

                DELETE FROM "ProductVariants" WHERE "ProductId" IS NULL;
                """);

            migrationBuilder.DropTable(
                name: "ProductsVariants");

            migrationBuilder.AlterColumn<int>(
                name: "ProductId",
                table: "ProductVariants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
