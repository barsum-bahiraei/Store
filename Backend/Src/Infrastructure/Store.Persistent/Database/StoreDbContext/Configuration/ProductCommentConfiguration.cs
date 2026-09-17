using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductCommentConfiguration : IEntityTypeConfiguration<ProductCommentEntity>
{
    public void Configure(EntityTypeBuilder<ProductCommentEntity> builder)
    {
        builder.ToTable("ProductComments");
        builder.Property(x => x.IsShow).HasDefaultValue(true);
        builder.HasOne(x => x.Product)
            .WithMany(x => x.ProductComments)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User)
            .WithMany(x => x.ProductComments)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}