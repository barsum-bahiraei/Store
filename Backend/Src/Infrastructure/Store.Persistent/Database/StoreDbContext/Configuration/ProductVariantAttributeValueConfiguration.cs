using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductVariantAttributeValueConfiguration : IEntityTypeConfiguration<ProductVariantAttributeValueEntity>
{
    public void Configure(EntityTypeBuilder<ProductVariantAttributeValueEntity> builder)
    {
        builder.ToTable("ProductVariantAttributeValues");
        builder.Property(x => x.Size).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(32);

        builder.HasOne(x => x.ProductVariant)
            .WithMany(x => x.AttributeValues)
            .HasForeignKey(x => x.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.ProductVariantId, x.Size }).IsUnique();
    }
}
