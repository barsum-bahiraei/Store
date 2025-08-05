using Store.Domain.Products;
using Microsoft.EntityFrameworkCore;
using Store.Domain;
using Store.Domain.Categories;
using Store.Domain.Accounts;

namespace Store.Persistent.Database.Sql;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ProductEntity> Products { get; set; }
    public DbSet<CategoryEntity> Categories { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<PermissionEntity> Permissions { get; set; }
    public DbSet<RoleEntity> Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override int SaveChanges()
    {
        var entries = ChangeTracker.Entries().Where(e =>
            e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var now = DateTime.UtcNow;
            var entity = (BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = now;
                entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = now;
            }
        }

        return base.SaveChanges();
    }
}