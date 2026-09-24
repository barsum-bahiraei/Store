using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariantEntity>
{
    public void Configure(EntityTypeBuilder<ProductVariantEntity> builder)
    {
        builder.ToTable("ProductVariants", table =>
        {
            table.HasCheckConstraint("CK_ProductVariants_Price", "\"Price\" >= 0");
            table.HasCheckConstraint("CK_ProductVariants_Stock", "\"Stock\" >= 0");
        });
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.CombinationKey).IsRequired().HasMaxLength(500);

        builder.HasOne(x => x.Product)
            .WithMany(x => x.ProductVariants)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.ProductId, x.CombinationKey }).IsUnique();
    }
}
