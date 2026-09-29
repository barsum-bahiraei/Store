using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Persistent.Database.StoreDbContext.Migrations
{
    /// <inheritdoc />
    public partial class RenameVariantValueColorFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ProductVariantAttributeValues",
                newName: "ColorName");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "ProductVariantAttributeValues",
                newName: "ColorCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ColorName",
                table: "ProductVariantAttributeValues",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "ColorCode",
                table: "ProductVariantAttributeValues",
                newName: "Code");
        }
    }
}
