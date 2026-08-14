using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.Sql.Configuration;

public class RoleAccessConfiguration : IEntityTypeConfiguration<RoleAccessEntity>
{
    public void Configure(EntityTypeBuilder<RoleAccessEntity> builder)
    {
        builder.ToTable("RoleAccess");

        builder.HasOne(x => x.Role)
            .WithMany(x => x.RoleAccess)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}