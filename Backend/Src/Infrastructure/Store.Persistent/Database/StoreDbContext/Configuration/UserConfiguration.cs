using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<UserEntity>
{
    public void Configure(EntityTypeBuilder<UserEntity> builder)
    {
        builder.ToTable("Users");
        builder.Property(x => x.FirstName).HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100);
        builder.Property(x => x.Email).HasMaxLength(320);
        builder.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(32);
        builder.Property(x => x.NationalCode).HasMaxLength(32);
        builder.Property(x => x.Address).HasMaxLength(1000);
        builder.Property(x => x.IsEmailVerified).HasDefaultValue(false);
        builder.Property(x => x.IsPhoneNumberVerified).HasDefaultValue(false);
        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.PhoneNumber).IsUnique();
    }
}
