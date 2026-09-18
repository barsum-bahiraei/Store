using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariantEntity>
{
    public void Configure(EntityTypeBuilder<ProductVariantEntity> builder)
    {
        builder.ToTable("ProductVariants");
        builder.HasMany(x => x.Products)
            .WithMany(x => x.ProductVariants)
            .UsingEntity(x => x.ToTable("ProductsVariants"));
    }
}
