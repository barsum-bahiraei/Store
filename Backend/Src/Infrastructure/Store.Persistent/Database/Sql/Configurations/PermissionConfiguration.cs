using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.Sql.Configurations;
internal class PermissionConfiguration : IEntityTypeConfiguration<PermissionEntity>
{
    public void Configure(EntityTypeBuilder<PermissionEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name)
            .IsRequired();
    }
}
