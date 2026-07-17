using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Attribute;

namespace Store.Persistent.Database.Sql.Configuration;

public class AttributeConfiguration : IEntityTypeConfiguration<AttributeEntity>
{
    public void Configure(EntityTypeBuilder<AttributeEntity> builder)
    {
        builder.ToTable("Attributes");
    }
}