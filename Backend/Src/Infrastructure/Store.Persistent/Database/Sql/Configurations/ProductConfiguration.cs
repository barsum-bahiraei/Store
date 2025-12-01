using Store.Domain.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Store.Persistent.Database.Sql.Configurations;

internal class ProductConfiguration : IEntityTypeConfiguration<ProductEntity>
{
    public void Configure(EntityTypeBuilder<ProductEntity> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.Price).IsRequired();
        builder.Property(x => x.DiscountPrice).IsRequired();
        builder
            .HasMany(x => x.ProductColors)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId);
        builder
            .HasMany(x => x.ProductComments)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId);
        builder
            .HasMany(x => x.ProductImages)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId);
        builder
            .HasMany(x => x.ProductAttributes)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId);
    }
}