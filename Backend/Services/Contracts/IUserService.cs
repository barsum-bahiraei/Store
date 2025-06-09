using StoreBackend.Models;

namespace StoreBackend.Services.Contracts;
public interface IUserService
{
    Task<UserDetailViewModel> Detail(CancellationToken cancellation);
    Task<UserCreateViewModel> Create(UserCreateParameters user, CancellationToken cancellation);
    string GenerateJwtToken(string userName);
    Task<bool> IsValidUser(LoginParameters parameters,CancellationToken cancellation);
}