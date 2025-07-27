using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Service.Users;

public interface IUserService
{
    Task<UserLoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation);
    Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation);
    string GenerateToken(string email, UserRoleEnum role);
    string HashPassword(string password);
}