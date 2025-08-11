using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.Sql.Migrations
{
    /// <inheritdoc />
    public partial class change_name_access : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AccessName",
                table: "RoleAccesses",
                newName: "ActionName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ActionName",
                table: "RoleAccesses",
                newName: "AccessName");
        }
    }
}
