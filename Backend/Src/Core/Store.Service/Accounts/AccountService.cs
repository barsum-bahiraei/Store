using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public class AccountService(
    IAccountRepository accountRepository,
    IConfiguration configuration,
    IPasswordHasher<UserEntity> passwordHasher
)
{
    public async Task<Result<List<UserListOutput>>> UserListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.UserListAsync(cancellation);
        var result = entities.Select(x => new UserListOutput
        {
            Id = x.Id,
            FirstName = x.FirstName,
            LastName = x.LastName,
            Email = x.Email,
            BirthDate = x.BirthDate,
            Address = x.Address,
            Gender = x.Gender,
            PhoneNumber = x.PhoneNumber,
            NationalCode = x.NationalCode,
            IsEmailVerified = x.IsEmailVerified,
        }).ToList();
        return Result<List<UserListOutput>>.Success(result);
    }

    public async Task<Result<UserGetOutput>> UserGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<UserGetOutput>.Failure("User not found");
        }
        var roleAccessList = await accountRepository.RoleAccessListAsync(cancellation);

        var result = new UserGetOutput
        {
            Id = entity.Id,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            BirthDate = entity.BirthDate,
            Address = entity.Address,
            Gender = entity.Gender,
            PhoneNumber = entity.PhoneNumber,
            NationalCode = entity.NationalCode,
            IsEmailVerified = entity.IsEmailVerified,
            Roles = entity.UserRoles.Select(x => new UserRoleGetOutput
            {
                Id = x.Id,
                RoleId = x.RoleId,
                RoleName = x.Role.Name,
                Access = roleAccessList
                    .Where(ra=>ra.RoleId == x.RoleId)
                    .Select(ra=> new UserRoleAccessGetOutput
                    {
                        Id = ra.Id,
                        ControllerName = ra.ControllerName,
                        ActionName = ra.ActionName
                    }).ToList()
            }).ToList()
        };
        return Result<UserGetOutput>.Success(result);
    }

    public async Task<Result<UserProfileGetOutput>> UserProfileGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<UserProfileGetOutput>.Failure("User not found");
        }

        var result = new UserProfileGetOutput
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            BirthDate = entity.BirthDate,
            Address = entity.Address,
            Gender = entity.Gender,
            PhoneNumber = entity.PhoneNumber,
            NationalCode = entity.NationalCode,
            IsEmailVerified = entity.IsEmailVerified,
        };
        return Result<UserProfileGetOutput>.Success(result);
    }

    public async Task<Result<UserRegisterOutput>> UserRegisterAsync(UserRegisterInput input,
        CancellationToken cancellation)
    {
        var user = await accountRepository.UserGetAsync(input.Email, cancellation);
        if (user != null)
        {
            return Result<UserRegisterOutput>.Failure("User exists!");
        }

        var entity = new UserEntity
        {
            FirstName = input.FirstName,
            LastName = input.LastName,
            Email = input.Email,
            Gender = input.Gender
        };
        entity.PasswordHash = passwordHasher.HashPassword(entity, input.Password);
        var created = await accountRepository.UserCreateAsync(entity, cancellation);
        var userRoleEntity = new UserRoleEntity
        {
            UserId = created.Id,
            RoleId = 1,
        };
        await accountRepository.UserRoleCreateAsync(userRoleEntity, cancellation);

        var result = new UserRegisterOutput
        {
            FirstName = created.FirstName,
            LastName = created.LastName,
            Email = created.Email,
            Gender = created.Gender,
            Address = created.Address,
            BirthDate = created.BirthDate,
            NationalCode = created.NationalCode,
            PhoneNumber = created.PhoneNumber,
            IsEmailVerified = created.IsEmailVerified,
            Token = GenerateToken(created.Id)
        };
        return Result<UserRegisterOutput>.Success(result);
    }

    public async Task<Result<UserLoginOutput>> UserLoginAsync(UserLoginInput input, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(input.Email, cancellation);
        if (entity == null)
        {
            return Result<UserLoginOutput>.Failure("Invalid email or password");
        }

        var passwordResult = passwordHasher.VerifyHashedPassword(entity, entity.PasswordHash, input.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return Result<UserLoginOutput>.Failure("Invalid email or password");
        }

        if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            entity.PasswordHash = passwordHasher.HashPassword(entity, input.Password);
            await accountRepository.UserUpdateAsync(entity, cancellation);
        }

        var result = new UserLoginOutput
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            Gender = entity.Gender,
            Address = entity.Address,
            BirthDate = entity.BirthDate,
            NationalCode = entity.NationalCode,
            PhoneNumber = entity.PhoneNumber,
            IsEmailVerified = entity.IsEmailVerified,
            Token = GenerateToken(entity.Id)
        };
        return Result<UserLoginOutput>.Success(result);
    }

    public async Task<Result<List<RoleListOutput>>> RoleListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.RoleListAsync(cancellation);
        var result = entities.Select(x => new RoleListOutput
        {
            Id = x.Id,
            Name = x.Name,
        }).ToList();
        return Result<List<RoleListOutput>>.Success(result);
    }

    public async Task<Result<RoleGetOutput>> RoleGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<RoleGetOutput>.Failure("Role not found");
        }

        var result = new RoleGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
        };
        return Result<RoleGetOutput>.Success(result);
    }

    public async Task<Result<RoleCreateOutput>> RoleCreateAsync(RoleCreateInput input, CancellationToken cancellation)
    {
        var entity = new RoleEntity
        {
            Name = input.Name,
        };
        var created = await accountRepository.RoleCreateAsync(entity, cancellation);
        var result = new RoleCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
        };
        return Result<RoleCreateOutput>.Success(result);
    }

    public async Task<Result<RoleUpdateOutput>> RoleUpdateAsync(int id, RoleUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<RoleUpdateOutput>.Failure("Role not found");
        }

        entity.Name = input.Name;
        await accountRepository.RoleUpdateAsync(entity, cancellation);
        var result = new RoleUpdateOutput
        {
            Id = entity.Id,
            Name = entity.Name,
        };
        return Result<RoleUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> RoleDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("Role not found");
        }

        await accountRepository.RoleDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<UserRoleCreateOutput>> UserRoleCreateAsync(UserRoleCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new UserRoleEntity
        {
            RoleId = input.RoleId,
            UserId = input.UserId,
        };
        var created = await accountRepository.UserRoleCreateAsync(entity, cancellation);
        var result = new UserRoleCreateOutput
        {
            Id = created.Id,
            RoleId = created.RoleId,
            UserId = created.UserId,
        };
        return Result<UserRoleCreateOutput>.Success(result);
    }

    public async Task<Result<bool>> UserRoleDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserRoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("UserRole not found");
        }

        await accountRepository.UserRoleDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<RoleAccessCreateOutput>> RoleAccessCreateAsync(RoleAccessCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new RoleAccessEntity
        {
            ControllerName = input.ControllerName,
            ActionName = input.ActionName,
            RoleId = input.RoleId,
        };
        var created = await accountRepository.RoleAccessCreateAsync(entity, cancellation);
        var result = new RoleAccessCreateOutput
        {
            Id = created.Id,
            ControllerName = created.ControllerName,
            ActionName = created.ActionName,
            RoleId = created.RoleId,
        };
        return Result<RoleAccessCreateOutput>.Success(result);
    }

    public async Task<Result<bool>> RoleAccessDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleAccessGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("Role Access not found");
        }

        await accountRepository.RoleAccessDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    private string GenerateToken(int id)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString())
        };

        var jwt = configuration.GetSection("Jwt");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["Key"]!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(jwt["ExpireMinutes"]!)
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}