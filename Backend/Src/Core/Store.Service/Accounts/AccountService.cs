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
    public async Task<LoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation)
    {
        var user = await userRepository.DetailAsync(parameters.Email, cancellation);
        var token = GenerateToken(user.Email);
        var userLogin = new LoginOutput
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
            var role = await userRepository.RoleListAsync(cancellation);
            var user = new UserEntity
            {
                Email = parameters.Email,
                Name = parameters.Name,
                Family = parameters.Family,
                Password = HashPassword(parameters.Password),
                Roles = new List<RoleEntity> { role.FirstOrDefault() }
            };
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
    public async Task<RoleCreateOutput> RoleCreateAsync(UserRoleCreateInput parameters, CancellationToken cancellation)
    {

        var roleEntity = new RoleEntity
        {
            Name = parameters.Name,
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

    public async Task<List<UserAccessListOutput>> UserAccessListAsync(string email, CancellationToken cancellation)
    {
        var AccessList = await userRepository.UserAccessListAsync(email, cancellation);
        var Accesss = AccessList.Select(x => new UserAccessListOutput
        {
            Id = x.Id,
            Name = x.Name,
            ControllerName = x.ControllerName,
        }).ToList();
        return Accesss;
    }

    public async Task AccessCreateAsync(AccessCreateInput parameters, CancellationToken cancellation)
    {
        var Access = new AccessEntity
        {
            Name = parameters.Name,
        };
        await userRepository.AccessCreateAsync(Access, cancellation);
    }

    public async Task<List<AccessListOutput>> AccessListAsync(CancellationToken cancellation)
    {
        var Accesss = await userRepository.AccessListAsync(cancellation);
        var output = Accesss.Select(x => new AccessListOutput
        {
            Id = x.Id,
            Name = x.Name,
            ControllerName = x.ControllerName,
        }).ToList();
        return output;
    }

    public async Task AccesssAssignRoleAsync(AccesssAssignRoleInput parameters, CancellationToken cancellation)
    {
        await userRepository.AccesssAssignRoleAsync(parameters.RoleId, parameters.AccessIds, cancellation);
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