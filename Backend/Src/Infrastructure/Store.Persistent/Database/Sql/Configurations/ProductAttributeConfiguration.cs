using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.Sql.Configurations;

public class ProductAttributeConfiguration:IEntityTypeConfiguration<ProductAttributeEntity>
{
    public void Configure(EntityTypeBuilder<ProductAttributeEntity> builder)
    {
        builder.ToTable("ProductAttributes");
        builder.Property(x => x.Name).IsRequired();
        builder
            .HasOne(x => x.Product)
            .WithMany(x => x.ProductAttributes)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}