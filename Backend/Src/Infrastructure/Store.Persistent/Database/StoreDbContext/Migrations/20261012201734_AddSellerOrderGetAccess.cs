using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerOrderGetAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO "RoleAccess" ("RoleId", "ControllerName", "ActionName", "CreatedAt", "UpdatedAt")
                SELECT "Id", 'Seller', 'OrderGet', NOW(), NOW()
                FROM "Roles"
                WHERE "Name" = 'Seller'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "RoleAccess"
                      WHERE "RoleId" = "Roles"."Id"
                        AND "ControllerName" = 'Seller'
                        AND "ActionName" = 'OrderGet'
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM "RoleAccess"
                WHERE "ControllerName" = 'Seller'
                  AND "ActionName" = 'OrderGet'
                  AND "RoleId" IN (SELECT "Id" FROM "Roles" WHERE "Name" = 'Seller');
                """);
        }
    }
}
