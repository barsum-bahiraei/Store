using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class AddFileDisplayOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "Files",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(
                """
                WITH ranked AS (
                    SELECT "Id",
                           ROW_NUMBER() OVER (
                               PARTITION BY "TargetId"
                               ORDER BY "IsMain" DESC, "Id" ASC
                           ) AS rn
                    FROM "Files"
                    WHERE "TableName" = 0
                      AND "TargetName" = 0
                      AND "FileType" IN (0, 3)
                )
                UPDATE "Files" AS f
                SET "DisplayOrder" = ranked.rn
                FROM ranked
                WHERE f."Id" = ranked."Id";
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO "RoleAccess" ("RoleId", "ControllerName", "ActionName", "CreatedAt", "UpdatedAt")
                SELECT DISTINCT source."RoleId", 'File', 'Order', NOW(), NOW()
                FROM "RoleAccess" AS source
                WHERE source."ControllerName" = 'File'
                  AND source."ActionName" IN ('Put', 'Delete')
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "RoleAccess" AS existing
                      WHERE existing."RoleId" = source."RoleId"
                        AND existing."ControllerName" = 'File'
                        AND existing."ActionName" = 'Order'
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
                  AND "ActionName" = 'Order';
                """);

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "Files");
        }
    }
}
