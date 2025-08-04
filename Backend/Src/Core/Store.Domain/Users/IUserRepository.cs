using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Domain.Users;

public interface IUserRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
}