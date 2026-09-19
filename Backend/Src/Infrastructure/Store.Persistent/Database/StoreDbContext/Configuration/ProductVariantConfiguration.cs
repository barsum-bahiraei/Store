using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariantEntity>
{
    public void Configure(EntityTypeBuilder<ProductVariantEntity> builder)
    {
        builder.ToTable("ProductVariants");
        builder.Property(x => x.ColorName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ColorCode).IsRequired().HasMaxLength(32);
        builder.HasMany(x => x.Products)
            .WithMany(x => x.ProductVariants)
            .UsingEntity(x => x.ToTable("ProductsVariants"));
    }
}
