using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Files;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class FileConfiguration : IEntityTypeConfiguration<FileEntity>
{
    public void Configure(EntityTypeBuilder<FileEntity> builder)
    {
        builder.ToTable("Files");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Url).IsRequired().HasMaxLength(1024);
        builder.HasIndex(x => new { x.TableName, x.TargetName, x.TargetId });
    }
}
