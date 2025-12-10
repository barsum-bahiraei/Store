using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Database.Sql.Configurations;

public class AttributeConfiguration : IEntityTypeConfiguration<AttributeEntity>
{
    public void Configure(EntityTypeBuilder<AttributeEntity> builder)
    {
        builder.ToTable("Attributes");
        builder.Property(x => x.Name)
            .IsRequired();
        builder.Property(x => x.Type)
            .IsRequired();
        builder.Property(x => x.Unit);
        //builder
        //    .HasMany(x => x.CategoryAttributes)
        //    .WithOne(x => x.Attribute)
        //    .HasForeignKey(x => x.Attribute);
        //builder
        //    .HasMany(x => x.ProductAttributes)
        //    .WithOne(x => x.Attribute)
        //    .HasForeignKey(x => x.AttributeId);
    }
}
