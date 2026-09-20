using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class UserDiscountCodeConfiguration : IEntityTypeConfiguration<UserDiscountCodeEntity>
{
    public void Configure(EntityTypeBuilder<UserDiscountCodeEntity> builder)
    {
        builder.ToTable("UserDiscountCodes");

        builder.HasOne(x => x.User)
            .WithMany(x => x.UserDiscountCodes)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.DiscountCode)
            .WithMany(x => x.UserDiscountCodes)
            .HasForeignKey(x => x.DiscountCodeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.DiscountCodeId }).IsUnique();
    }
}
