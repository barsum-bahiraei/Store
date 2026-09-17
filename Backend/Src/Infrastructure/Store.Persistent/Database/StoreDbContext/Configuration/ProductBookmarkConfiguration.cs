using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Products;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProductBookmarkConfiguration : IEntityTypeConfiguration<ProductBookmarkEntity>
{
    public void Configure(EntityTypeBuilder<ProductBookmarkEntity> builder)
    {
        builder.ToTable("ProductBookmarks");
        builder.HasOne(x => x.Product)
            .WithMany(x => x.ProductBookmarks)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User)
            .WithMany(x => x.ProductBookmarks)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.ProductId, x.UserId }).IsUnique();
    }
}
