using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Categories;

namespace Store.Persistent.Database.Sql.Configuration;

public class CategoryAttributeConfiguration : IEntityTypeConfiguration<CategoryAttributeEntity>
{
    public void Configure(EntityTypeBuilder<CategoryAttributeEntity> builder)
    {
        builder.ToTable("CategoriesAttributes");
        builder.HasOne(x => x.Category)
            .WithMany(x => x.CategoryAttributes)
            .HasForeignKey(x => x.CategoryId);
        builder.HasOne(x => x.Attribute)
            .WithMany(x => x.CategoryAttributes)
            .HasForeignKey(x => x.AttributeId);
    }
}