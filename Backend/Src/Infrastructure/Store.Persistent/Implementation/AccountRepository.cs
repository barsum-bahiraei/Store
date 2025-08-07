using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class AccountRepository(AppDbContext context) : IAccountRepository
{
    public async Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation)
    {
        await context.Users.AddAsync(parameters, cancellation);
        await context.SaveChangesAsync(cancellation);
        return parameters;
    }

    public async Task<UserEntity> DetailAsync(string email, CancellationToken cancellation)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellation);
        return user;
    }

    public async Task<bool> HasUserAsync(string email, CancellationToken cancellation)
    {
        return await context.Users.AnyAsync(x => x.Email == email, cancellation);
    }

    public async Task<List<RoleEntity>> RoleListAsync(string email, CancellationToken cancellation)
    {
        var user = await context.Users
            .Include(x => x.Roles)
            .FirstOrDefaultAsync(x => x.Email == email, cancellation);
        return user.Roles.ToList();
    }

    public async Task<List<PermissionEntity>> PermissionListAsync(string email, CancellationToken cancellation)
    {
        var permissions = await context.Users
            .Where(x => x.Email == email)
            .SelectMany(x => x.Roles.SelectMany(z => z.Permissions))
            .Distinct()
            .ToListAsync(cancellation);
        return permissions;
    }

    public async Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation)
    {
        await context.Roles.AddAsync(parameters, cancellation);
        await context.SaveChangesAsync(cancellation);
        return parameters;
    }
}