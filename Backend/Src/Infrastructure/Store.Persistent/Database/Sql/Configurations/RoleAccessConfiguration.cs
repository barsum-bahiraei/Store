using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Accounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Database.Sql.Configurations;
public class RoleAccessConfiguration : IEntityTypeConfiguration<RoleAccessEntity>
{
    public void Configure(EntityTypeBuilder<RoleAccessEntity> builder)
    {
        builder.ToTable("RoleAccess");
        builder.HasOne(x => x.Role)
            .WithMany(x => x.RoleAccess)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
