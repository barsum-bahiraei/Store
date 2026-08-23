using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class RoleAccessConfiguration : IEntityTypeConfiguration<RoleAccessEntity>
{
    public void Configure(EntityTypeBuilder<RoleAccessEntity> builder)
    {
        builder.ToTable("RoleAccess");
        builder.Property(x => x.ControllerName).HasMaxLength(128);
        builder.Property(x => x.ActionName).HasMaxLength(128);
        builder.HasIndex(x => new { x.RoleId, x.ControllerName, x.ActionName }).IsUnique();

        builder.HasOne(x => x.Role)
            .WithMany(x => x.RoleAccess)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
