using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public class UserService(IAccountRepository userRepository, IConfiguration configuration) : IAccountService
{
    public async Task<UserLoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation)
    {
        var user = await userRepository.DetailAsync(parameters.Email, cancellation);
        var token = GenerateToken(user.Email);
        var userLogin = new UserLoginOutput
        {
            Name = user.Name,
            Family = user.Family,
            Email = user.Email,
            Token = token,
        };
        return userLogin;
    }

    public async Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        var hasUser = await userRepository.HasUserAsync(parameters.Email, cancellation);
        if (!hasUser)
        {
            var user = new UserEntity
            {
                Email = parameters.Email,
                Name = parameters.Name,
                Family = parameters.Family
            };
            parameters.Password = HashPassword(parameters.Password);
            await userRepository.CreateAsync(user, cancellation);
            var token = GenerateToken(parameters.Email);
            return token;
        }

        return null;
    }

    public async Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation)
    {
        var user = await userRepository.DetailAsync(email, cancellation);
        var userDetail = new UserDetailOutput
        {
            Name = user.Name,
            Family = user.Family,
            Email = user.Email,
        };
        return userDetail;
    }

    public string GenerateToken(string email)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(10),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        byte[] bytes = Encoding.UTF8.GetBytes(password + configuration["SecretKey"]);
        byte[] hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}