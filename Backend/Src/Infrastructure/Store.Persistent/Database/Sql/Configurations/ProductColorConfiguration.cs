using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.Sql.Configurations;

public class ProductColorConfiguration : IEntityTypeConfiguration<ProductColorEntity>
{
    public void Configure(EntityTypeBuilder<ProductColorEntity> builder)
    {
        builder.ToTable("ProductColors");
        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.HexCode).IsRequired();
        builder
            .HasOne(x=>x.Product)
            .WithMany(x=>x.ProductColors)
            .HasForeignKey(x=>x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}