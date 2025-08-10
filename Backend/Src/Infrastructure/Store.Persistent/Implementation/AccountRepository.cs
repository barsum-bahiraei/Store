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

    public async Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation)
    {
        await context.Roles.AddAsync(parameters, cancellation);
        await context.SaveChangesAsync(cancellation);
        return parameters;
    }

    public Task<List<RoleAccessEntity>> UserRoleAccessListAsync(string email, CancellationToken cancellation)
    {
        var output = context.UserRoles
            .Where(x => x.User.Email == email)
            .SelectMany(x => x.Role.RoleAccess)
            .ToListAsync(cancellation);
        return output;
    }
}