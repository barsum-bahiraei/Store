using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;
using System.Security;

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

    public async Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation)
    {
        var roles = await context.Roles
            .Distinct()
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return roles;
    }

    public async Task AccessCreateAsync(AccessEntity parameters, CancellationToken cancellation)
    {
        await context.Accesss.AddAsync(parameters, cancellation);
    }

    public async Task<List<AccessEntity>> AccessListAsync(CancellationToken cancellation)
    {
        var Accesss = await context.Accesss.ToListAsync(cancellation);
        return Accesss;
    }

    public async Task<List<AccessEntity>> UserAccessListAsync(string email, CancellationToken cancellation)
    {
        var Accesss = await context.Users
            .Where(x => x.Email == email)
            .SelectMany(x => x.Roles.SelectMany(z => z.Access))
            .Distinct()
            .ToListAsync(cancellation);
        return Accesss;
    }

    public async Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation)
    {
        await context.Roles.AddAsync(parameters, cancellation);
        await context.SaveChangesAsync(cancellation);
        return parameters;
    }

    public async Task AccesssAssignRoleAsync(int roleId, List<int> parameters, CancellationToken cancellation)
    {
        var Accesss = await context.Accesss.Where(x => parameters.Contains(x.Id)).ToListAsync();
        var role = await context.Roles.Include(x => x.Access).FirstOrDefaultAsync(x => x.Id == roleId, cancellation);
        role.Access.AddRange(Accesss);
        await context.SaveChangesAsync(cancellation);
    }
}