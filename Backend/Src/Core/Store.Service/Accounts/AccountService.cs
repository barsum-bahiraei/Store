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
    public async Task<LoginOutput> LoginAsync(UserLoginInput input, CancellationToken cancellation)
    {
        var user = await userRepository.DetailAsync(input.Email, cancellation);
        var token = GenerateToken(user.Email);
        var output = new LoginOutput
        {
            Name = user.Name,
            Family = user.Family,
            Email = user.Email,
            Token = token,
        };
        return output;
    }

    public async Task<string> CreateAsync(UserCreateInput input, CancellationToken cancellation)
    {
        var hasUser = await userRepository.HasUserAsync(input.Email, cancellation);
        if (!hasUser)
        {
            var roles = await userRepository.RoleListAsync(cancellation);
            var user = new UserEntity
            {
                Email = input.Email,
                Name = input.Name,
                Family = input.Family,
                Password = HashPassword(input.Password),
            };
            await userRepository.CreateAsync(user, cancellation);
            var token = GenerateToken(input.Email);
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
    public async Task<RoleCreateOutput> RoleCreateAsync(UserRoleCreateInput input, CancellationToken cancellation)
    {

        var roleEntity = new RoleEntity
        {
            Name = input.Name,
        };

        var createdRole = await userRepository.RoleCreateAsync(roleEntity, cancellation);

        var output = new RoleCreateOutput
        {
            Id = createdRole.Id,
            Name = createdRole.Name,
        };

        return output;

    }

    public async Task<List<RoleListOutput>> RoleListAsync(CancellationToken cancellation)
    {
        var roleList = await userRepository.RoleListAsync(cancellation);
        var roles = roleList.Select(x => new RoleListOutput
        {
            Id = x.Id,
            Name = x.Name,
        }).ToList();
        return roles;
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

    public async Task<List<AccessListOutput>> UserRoleAccessListAsync(string email, CancellationToken cancellation)
    {
        var accessList = await userRepository.UserRoleAccessListAsync(email, cancellation);
        var output = accessList
            .Select(x => new AccessListOutput
            {
                Id = x.Id,
                ActionName = x.ActionName,
                ControllerName = x.ControllerName,
            })
            .ToList();
        return output;
    }

    public async Task AccessListAsignRoleAsync(AccessListAssignRoleInput input, CancellationToken cancellation)
    {
        var roleAccessList = input.ActionList
            .Select(x => new RoleAccessEntity
            {
                RoleId = input.RoleId,
                ActionName = x.ActionName,
                ControllerName = x.ControllerName,
            })
            .ToList();
        await userRepository.AccessListAsignRoleAsync(roleAccessList, cancellation);
    }

    public async Task RoleAssignUserAsync(RoleAssignUserInput input, CancellationToken cancellation)
    {
        var userRole = new UserRoleEntity
        {
            UserId = input.UserId,
            RoleId = input.RoleId,
        };
        await userRepository.RoleAssignUserAsync(userRole, cancellation);
    }
}