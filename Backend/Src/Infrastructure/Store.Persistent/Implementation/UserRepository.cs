using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        var user = new UserEntity
        {
            Name = parameters.Name,
            Family = parameters.Family,
            Email = parameters.Email,
            Password = parameters.Password,
            Role = parameters.Role
        };
        await context.Users.AddAsync(user, cancellation);
        await context.SaveChangesAsync(cancellation);
        return user.Email;
    }

    public async Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation)
    {
        var user = await context.Users
            .Where(u => u.Email == email)
            .Select(u => new UserDetailOutput
            {
                Name = u.Name,
                Family = u.Email,
                Email = u.Email,
                Role = u.Role,
            })
            .FirstOrDefaultAsync(cancellation);
        return user;
    }

    public async Task<bool> HasUserAsync(string email, CancellationToken cancellation)
    {
        return await context.Users.AnyAsync(x => x.Email == email, cancellation);
    }
}