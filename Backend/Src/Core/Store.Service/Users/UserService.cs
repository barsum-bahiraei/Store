using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Service.Users;

public class UserService(IUserRepository userRepository) : IUserService
{
    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task ListAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<UserCreateOutput> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        var user = await userRepository.CreateAsync(parameters, cancellation);
        return user;
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