using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Domain.Users;

public interface IUserRepository
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task ListAsync(CancellationToken cancellation);
    Task<UserCreateOutput> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);

    string GenerateToken(UserCreateInput parameters);
}