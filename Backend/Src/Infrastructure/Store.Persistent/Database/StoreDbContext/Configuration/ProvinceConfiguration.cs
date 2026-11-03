using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Locations;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class ProvinceConfiguration : IEntityTypeConfiguration<ProvinceEntity>
{
    public void Configure(EntityTypeBuilder<ProvinceEntity> builder)
    {
        builder.ToTable("Provinces");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
