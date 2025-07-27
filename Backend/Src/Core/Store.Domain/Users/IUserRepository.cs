using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Domain.Users;

public interface IUserRepository
{
    Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation);
    Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
}