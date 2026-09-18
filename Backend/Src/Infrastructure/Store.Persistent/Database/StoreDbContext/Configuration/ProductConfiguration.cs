using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductConfiguration : IEntityTypeConfiguration<ProductEntity>
{
    public void Configure(EntityTypeBuilder<ProductEntity> builder)
    {
        builder.ToTable("Products");
        builder.HasOne(x => x.Category)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.CategoryId);
        builder.HasOne(x => x.Seller)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductBrand)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.ProductBrandId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Property(x => x.IsAvailable).HasDefaultValue(true);
    }
}
