using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.Sql.Configuration;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttributeEntity>
{
    public void Configure(EntityTypeBuilder<ProductAttributeEntity> builder)
    {
        builder.ToTable("ProductsAttributes");

        builder.HasOne(x => x.Product)
            .WithMany(x => x.ProductAttributes)
            .HasForeignKey(x => x.ProductId);

        builder.HasOne(x => x.Attribute)
            .WithMany(x => x.ProductAttributes)
            .HasForeignKey(x => x.AttributeId);
    }
}