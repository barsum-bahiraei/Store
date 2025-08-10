using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.Sql.Configurations;
public class RoleAccessConfiguration : IEntityTypeConfiguration<RoleAccessEntity>
{
    public void Configure(EntityTypeBuilder<RoleAccessEntity> builder)
    {
        builder.ToTable("RoleAccesses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.AccessName).IsRequired();
        builder.Property(x => x.ControllerName).IsRequired();

        builder.HasOne(x => x.Role)
            .WithMany(x => x.RoleAccess)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
