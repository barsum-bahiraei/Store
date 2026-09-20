using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class DiscountCodeConfiguration : IEntityTypeConfiguration<DiscountCodeEntity>
{
    public void Configure(EntityTypeBuilder<DiscountCodeEntity> builder)
    {
        builder.ToTable("DiscountCodes");
        builder.Property(x => x.Code).IsRequired().HasMaxLength(100);
        builder.Property(x => x.DiscountPercent).HasPrecision(5, 2);
        builder.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
