using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.Sql.Configurations;
public class RoleConfiguration : IEntityTypeConfiguration<RoleEntity>
{
    public void Configure(EntityTypeBuilder<RoleEntity> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name)
            .IsRequired();
        //builder.HasMany(x => x.UserRoles)
        //    .WithOne(x => x.Role)
        //    .HasForeignKey(x => x.RoleId);
        //builder.HasMany(x => x.RoleAccess)
        //    .WithOne(x => x.Role)
        //    .HasForeignKey(x => x.RoleId);
    }
}
