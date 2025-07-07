using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Service.Users;

public interface IUserService
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task ListAsync(CancellationToken cancellation);
    Task<UserCreateOutput> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}