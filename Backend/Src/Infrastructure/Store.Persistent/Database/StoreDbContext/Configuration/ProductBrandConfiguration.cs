using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductBrandConfiguration : IEntityTypeConfiguration<ProductBrandEntity>
{
    public void Configure(EntityTypeBuilder<ProductBrandEntity> builder)
    {
        builder.ToTable("ProductBrands");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
    }
}
