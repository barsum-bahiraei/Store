using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class VariantConfiguration : IEntityTypeConfiguration<VariantEntity>
{
    public void Configure(EntityTypeBuilder<VariantEntity> builder)
    {
        builder.ToTable("Variants");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(32);
    }
}
