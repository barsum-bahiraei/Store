using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Users;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class UserRepository(AppDbContext context,IConfiguration configuration) : IUserRepository
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
        var role = parameters.Role.ToString();
        Console.WriteLine(role);
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

    public string GenerateToken(UserCreateInput parameters)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, parameters.Email),
            new Claim(ClaimTypes.Role, parameters.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}