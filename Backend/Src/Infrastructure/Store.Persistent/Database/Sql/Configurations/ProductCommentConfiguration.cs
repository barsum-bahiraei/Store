using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.Sql.Configurations;

public class ProductCommentConfiguration : IEntityTypeConfiguration<ProductCommentEntity>
{
    public void Configure(EntityTypeBuilder<ProductCommentEntity> builder)
    {
        builder.ToTable("ProductComments");
        builder.Property(x => x.Text).IsRequired();
        builder
            .HasOne(x => x.Product)
            .WithMany(x => x.ProductComments)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}