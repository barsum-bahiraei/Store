using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class AddFileSetMainAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO "RoleAccess" ("RoleId", "ControllerName", "ActionName", "CreatedAt", "UpdatedAt")
                SELECT DISTINCT "RoleId", 'File', 'SetMain', NOW(), NOW()
                FROM "RoleAccess"
                WHERE "ControllerName" = 'File'
                  AND "ActionName" = 'Delete'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "RoleAccess" AS existing
                      WHERE existing."RoleId" = "RoleAccess"."RoleId"
                        AND existing."ControllerName" = 'File'
                        AND existing."ActionName" = 'SetMain'
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM "RoleAccess"
                WHERE "ControllerName" = 'File'
                  AND "ActionName" = 'SetMain';
                """);
        }
    }
}
