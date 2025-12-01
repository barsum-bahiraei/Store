using Store.Domain.Products;
using Microsoft.EntityFrameworkCore;
using Store.Domain;
using Store.Domain.Accounts;
using Store.Domain.Categories;
using Store.Domain.Attributes;

namespace Store.Persistent.Database.Sql;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }
    public DbSet<RoleEntity> Roles { get; set; }
    public DbSet<UserRoleEntity> UserRoles { get; set; }
    public DbSet<RoleAccessEntity> RoleAccess { get; set; }
    public DbSet<ProductEntity> Products { get; set; }
    public DbSet<ProductColorEntity> ProductColors { get; set; }
    public DbSet<ProductCommentEntity> ProductComments { get; set; }
    public DbSet<ProductImageEntity> ProductImages { get; set; }
    public DbSet<ProductAttributeEntity> ProductAttributes { get; set; }
    public DbSet<CategoryEntity> Categories { get; set; }
    public DbSet<AttributeEntity> Attributes { get; set; }
    public DbSet<CategoryAttributeEntity> CategoryAttributes { get; set; }

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