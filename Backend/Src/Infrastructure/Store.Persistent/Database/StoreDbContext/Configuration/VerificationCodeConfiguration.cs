using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class VerificationCodeConfiguration : IEntityTypeConfiguration<VerificationCodeEntity>
{
    public void Configure(EntityTypeBuilder<VerificationCodeEntity> builder)
    {
        builder.ToTable("VerificationCodes");
        builder.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(32);
        builder.Property(x => x.CodeHash).IsRequired().HasMaxLength(64);
        builder.Property(x => x.IsUsed).HasDefaultValue(false);
        builder.HasIndex(x => new { x.PhoneNumber, x.IsUsed, x.ExpiresAt });
    }
}
