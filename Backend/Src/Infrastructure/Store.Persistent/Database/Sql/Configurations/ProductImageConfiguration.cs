using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.Sql.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImageEntity>
{
    public void Configure(EntityTypeBuilder<ProductImageEntity> builder)
    {
        builder.ToTable("ProductImages");
        builder.Property(x => x.Url).IsRequired();
        builder
            .HasOne(x => x.Product)
            .WithMany(x => x.ProductImages)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}