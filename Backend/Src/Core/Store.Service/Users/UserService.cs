using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;

namespace Store.Service.Users;

public class UserService(IUserRepository userRepository, IConfiguration configuration) : IUserService
{
    public async Task<UserLoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation)
    {
        
    }

    public async Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        var hasUser = await userRepository.HasUserAsync(parameters.Email, cancellation);
        if (!hasUser)
        {
            parameters.Password = HashPassword(parameters.Password);
            await userRepository.CreateAsync(parameters, cancellation);
            var token = GenerateToken(parameters.Email, parameters.Role);
            return token;
        }

        return null;
    }

    public async Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation)
    {
        var user = await userRepository.DetailAsync(email, cancellation);
        return user;
    }

    public string GenerateToken(string email, UserRoleEnum role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
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