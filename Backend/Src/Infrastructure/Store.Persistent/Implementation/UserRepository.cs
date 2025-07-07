using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task ListAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task<UserCreateOutput> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}