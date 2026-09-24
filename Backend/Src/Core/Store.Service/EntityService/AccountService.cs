using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;
using Store.Service.ProviderService;

namespace Store.Service.EntityService;

public class AccountService(
    IAccountRepository accountRepository,
    IConfiguration configuration,
    KavenegarSmsService smsService
)
{
    public async Task<Result<List<UserListOutput>>> UserListAsync(UserListInput input, CancellationToken cancellation)
    {
        var entities = await accountRepository.UserListAsync(input, cancellation);
        var result = entities.Select(x => new UserListOutput
        {
            Id = x.Id,
            FirstName = x.FirstName,
            LastName = x.LastName,
            Email = x.Email,
            BirthDate = x.BirthDate,
            Address = x.Address,
            Latitude = x.Latitude,
            Longitude = x.Longitude,
            Gender = x.Gender,
            PhoneNumber = x.PhoneNumber,
            NationalCode = x.NationalCode,
            IsEmailVerified = x.IsEmailVerified,
            IsPhoneNumberVerified = x.IsPhoneNumberVerified,
            Roles = x.UserRoles.Select(userRole => userRole.Role.Name).ToList()
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
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            Gender = entity.Gender,
            PhoneNumber = entity.PhoneNumber,
            NationalCode = entity.NationalCode,
            IsEmailVerified = entity.IsEmailVerified,
            IsPhoneNumberVerified = entity.IsPhoneNumberVerified,
            Roles = entity.UserRoles.Select(x => new UserRoleGetOutput
            {
                Id = x.Id,
                RoleId = x.RoleId,
                RoleName = x.Role.Name,
                Access = roleAccessList
                    .Where(ra => ra.RoleId == x.RoleId)
                    .Select(ra => new UserRoleAccessGetOutput
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
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            Gender = entity.Gender,
            PhoneNumber = entity.PhoneNumber,
            NationalCode = entity.NationalCode,
            IsEmailVerified = entity.IsEmailVerified,
            IsPhoneNumberVerified = entity.IsPhoneNumberVerified,
            Roles = entity.UserRoles.Select(x => x.Role.Name).ToList()
        };
        return Result<UserProfileGetOutput>.Success(result);
    }

    public async Task<Result<UserProfileUpdateOutput>> UserProfileUpdateAsync(int id, UserProfileUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(id, cancellation);
        if (entity == null)
            return Result<UserProfileUpdateOutput>.Failure("User not found");

        var email = string.IsNullOrWhiteSpace(input.Email) ? null : input.Email.Trim();
        if (email != null && !string.Equals(email, entity.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailOwner = await accountRepository.UserGetByEmailAsync(email, cancellation);
            if (emailOwner != null && emailOwner.Id != id)
                return Result<UserProfileUpdateOutput>.Failure("Email is already in use");
            entity.IsEmailVerified = false;
        }

        entity.FirstName = string.IsNullOrWhiteSpace(input.FirstName) ? null : input.FirstName.Trim();
        entity.LastName = string.IsNullOrWhiteSpace(input.LastName) ? null : input.LastName.Trim();
        entity.Email = email;
        entity.Address = input.Address;
        entity.Latitude = input.Latitude;
        entity.Longitude = input.Longitude;
        entity.Gender = input.Gender;
        entity.NationalCode = input.NationalCode;
        entity.BirthDate = input.BirthDate;

        var updated = await accountRepository.UserUpdateAsync(entity, cancellation);
        return Result<UserProfileUpdateOutput>.Success(new UserProfileUpdateOutput
        {
            FirstName = updated.FirstName,
            LastName = updated.LastName,
            Email = updated.Email,
            Address = updated.Address,
            Latitude = updated.Latitude,
            Longitude = updated.Longitude,
            Gender = updated.Gender,
            NationalCode = updated.NationalCode,
            BirthDate = updated.BirthDate
        });
    }

    public async Task<Result<UserOtpSendOutput>> UserOtpSendAsync(UserOtpSendInput input,
        CancellationToken cancellation)
    {
        var phoneNumber = NormalizePhoneNumber(input.PhoneNumber);
        if (phoneNumber == null)
            return Result<UserOtpSendOutput>.Failure("Phone number is invalid");

        var code = RandomNumberGenerator.GetInt32(10000, 100000).ToString();
        var entity = new VerificationCodeEntity
        {
            PhoneNumber = phoneNumber,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false
        };

        var created = await accountRepository.VerificationCodeReplaceAsync(entity, cancellation);
        if (created == null)
            return Result<UserOtpSendOutput>.Failure("Please wait before requesting another verification code");

        //await smsService.SendVerificationCodeAsync(phoneNumber, code, cancellation);

        return Result<UserOtpSendOutput>.Success(new UserOtpSendOutput
        {
            ExpiresAt = created.ExpiresAt
        });
    }

    public async Task<Result<UserOtpVerifyOutput>> UserOtpVerifyAsync(
        UserOtpVerifyInput input,
        CancellationToken cancellation)
    {
        var phoneNumber = NormalizePhoneNumber(input.PhoneNumber);
        if (phoneNumber == null || string.IsNullOrWhiteSpace(input.Code) || input.Code.Length != 5 ||
            input.Code.Any(x => !char.IsDigit(x)))
            return Result<UserOtpVerifyOutput>.Failure("Phone number or verification code is invalid");

        var verificationCode = await accountRepository.VerificationCodeGetAsync(phoneNumber, cancellation);
        if (verificationCode == null || verificationCode.ExpiresAt <= DateTime.UtcNow ||
            verificationCode.Code != input.Code)
            return Result<UserOtpVerifyOutput>.Failure("Verification code is invalid or expired");

        var authentication = await accountRepository.VerificationCodeUseAsync(
            verificationCode.Id,
            phoneNumber,
            "User",
            cancellation);

        if (authentication == null)
            return Result<UserOtpVerifyOutput>.Failure("Verification code is invalid or expired");

        var (user, isNewUser) = authentication.Value;

        return Result<UserOtpVerifyOutput>.Success(new UserOtpVerifyOutput
        {
            Id = user.Id,
            PhoneNumber = user.PhoneNumber,
            IsNewUser = isNewUser,
            Token = GenerateToken(user.Id)
        });
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

    public async Task<Result<List<DiscountCodeListOutput>>> DiscountCodeListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.DiscountCodeListAsync(cancellation);
        var result = entities.Select(x => new DiscountCodeListOutput
        {
            Id = x.Id,
            Code = x.Code,
            DiscountPercent = x.DiscountPercent,
            MaxDiscountAmount = x.MaxDiscountAmount,
            PaymentMethod = x.PaymentMethod,
            StartDate = x.StartDate,
            EndDate = x.EndDate,
            IsActive = x.IsActive,
            AssignedUserCount = x.UserDiscountCodes.Count,
            UsedUserCount = x.UserDiscountCodes.Count(userDiscountCode => userDiscountCode.IsUsed)
        }).ToList();
        return Result<List<DiscountCodeListOutput>>.Success(result);
    }

    public async Task<Result<DiscountCodeOutput>> DiscountCodeGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.DiscountCodeGetAsync(id, cancellation);
        return entity == null
            ? Result<DiscountCodeOutput>.Failure("Discount code not found")
            : Result<DiscountCodeOutput>.Success(MapDiscountCode(entity));
    }

    public async Task<Result<DiscountCodeOutput>> DiscountCodeCreateAsync(DiscountCodeUpsertInput input,
        CancellationToken cancellation)
    {
        var validationError = ValidateDiscountCode(input);
        if (validationError != null)
            return Result<DiscountCodeOutput>.Failure(validationError);

        var code = input.Code.Trim();
        if (await accountRepository.DiscountCodeExistsAsync(code, null, cancellation))
            return Result<DiscountCodeOutput>.Failure("Discount code already exists");

        var usersResult = await GetDiscountCodeUsersAsync(input.UserIds, cancellation);
        if (usersResult.Error != null)
            return Result<DiscountCodeOutput>.Failure(usersResult.Error);

        var entity = new DiscountCodeEntity
        {
            Code = code,
            DiscountPercent = input.DiscountPercent,
            MaxDiscountAmount = input.MaxDiscountAmount,
            PaymentMethod = input.PaymentMethod,
            StartDate = input.StartDate,
            EndDate = input.EndDate,
            IsActive = input.IsActive,
            UserDiscountCodes = usersResult.Users.Select(user => new UserDiscountCodeEntity
            {
                UserId = user.Id,
                User = user,
                IsUsed = false
            }).ToList()
        };

        var created = await accountRepository.DiscountCodeCreateAsync(entity, cancellation);
        return Result<DiscountCodeOutput>.Success(MapDiscountCode(created));
    }

    public async Task<Result<DiscountCodeOutput>> DiscountCodeUpdateAsync(int id, DiscountCodeUpsertInput input,
        CancellationToken cancellation)
    {
        var validationError = ValidateDiscountCode(input);
        if (validationError != null)
            return Result<DiscountCodeOutput>.Failure(validationError);

        var entity = await accountRepository.DiscountCodeGetAsync(id, cancellation);
        if (entity == null)
            return Result<DiscountCodeOutput>.Failure("Discount code not found");

        var code = input.Code.Trim();
        if (await accountRepository.DiscountCodeExistsAsync(code, id, cancellation))
            return Result<DiscountCodeOutput>.Failure("Discount code already exists");

        var usersResult = await GetDiscountCodeUsersAsync(input.UserIds, cancellation);
        if (usersResult.Error != null)
            return Result<DiscountCodeOutput>.Failure(usersResult.Error);

        var userIds = usersResult.Users.Select(x => x.Id).ToHashSet();
        foreach (var assignment in entity.UserDiscountCodes.Where(x => !userIds.Contains(x.UserId)).ToList())
            entity.UserDiscountCodes.Remove(assignment);

        var assignedUserIds = entity.UserDiscountCodes.Select(x => x.UserId).ToHashSet();
        foreach (var user in usersResult.Users.Where(x => !assignedUserIds.Contains(x.Id)))
        {
            entity.UserDiscountCodes.Add(new UserDiscountCodeEntity
            {
                UserId = user.Id,
                User = user,
                DiscountCodeId = entity.Id,
                IsUsed = false
            });
        }

        entity.Code = code;
        entity.DiscountPercent = input.DiscountPercent;
        entity.MaxDiscountAmount = input.MaxDiscountAmount;
        entity.PaymentMethod = input.PaymentMethod;
        entity.StartDate = input.StartDate;
        entity.EndDate = input.EndDate;
        entity.IsActive = input.IsActive;

        var updated = await accountRepository.DiscountCodeUpdateAsync(entity, cancellation);
        return Result<DiscountCodeOutput>.Success(MapDiscountCode(updated));
    }

    public async Task<Result<bool>> DiscountCodeDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.DiscountCodeGetAsync(id, cancellation);
        if (entity == null)
            return Result<bool>.Failure("Discount code not found");

        if (await accountRepository.DiscountCodeIsUsedAsync(id, cancellation))
            return Result<bool>.Failure("Discount code is used by an invoice and cannot be deleted");

        await accountRepository.DiscountCodeDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<RoleAccessListOutput>>> RoleAccessListAsync(
        int roleId,
        CancellationToken cancellation
    )
    {
        var entities = await accountRepository.RoleAccessListAsync(roleId, cancellation);
        var result = entities.Select(x => new RoleAccessListOutput
            {
                Id = x.Id,
                RoleId = x.RoleId,
                ControllerName = x.ControllerName,
                ActionName = x.ActionName,
            }
        ).ToList();
        return Result<List<RoleAccessListOutput>>.Success(result);
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

    private async Task<(List<UserEntity> Users, string? Error)> GetDiscountCodeUsersAsync(
        List<int> requestedUserIds, CancellationToken cancellation)
    {
        var userIds = requestedUserIds.Distinct().ToList();
        var users = await accountRepository.UserListAsync(userIds, cancellation);
        if (users.Count != userIds.Count)
            return ([], "One or more users were not found");

        return (users, null);
    }

    private static string? ValidateDiscountCode(DiscountCodeUpsertInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Code))
            return "Discount code is required";
        if (input.Code.Trim().Length > 100)
            return "Discount code cannot exceed 100 characters";
        if (input.DiscountPercent is <= 0 or > 100)
            return "Discount percent must be greater than zero and at most 100";
        if (input.MaxDiscountAmount is < 0)
            return "Maximum discount amount cannot be negative";
        if (input.PaymentMethod.HasValue && !Enum.IsDefined(input.PaymentMethod.Value))
            return "Payment method is invalid";
        if (input.StartDate.HasValue && input.EndDate.HasValue && input.StartDate > input.EndDate)
            return "Start date cannot be after end date";
        if (input.UserIds == null || input.UserIds.Count == 0)
            return "At least one user must be selected";
        if (input.UserIds.Any(x => x <= 0))
            return "User id is invalid";
        return null;
    }

    private static DiscountCodeOutput MapDiscountCode(DiscountCodeEntity entity)
    {
        return new DiscountCodeOutput
        {
            Id = entity.Id,
            Code = entity.Code,
            DiscountPercent = entity.DiscountPercent,
            MaxDiscountAmount = entity.MaxDiscountAmount,
            PaymentMethod = entity.PaymentMethod,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            IsActive = entity.IsActive,
            Users = entity.UserDiscountCodes.Select(x => new DiscountCodeUserOutput
            {
                Id = x.Id,
                UserId = x.UserId,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                PhoneNumber = x.User.PhoneNumber,
                IsUsed = x.IsUsed,
                UsedAt = x.UsedAt
            }).ToList()
        };
    }

    private static string? NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return null;

        var normalized = phoneNumber.Trim()
            .Replace(" ", string.Empty)
            .Replace("-", string.Empty);
        if (normalized.StartsWith("+98"))
            normalized = $"0{normalized[3..]}";
        else if (normalized.StartsWith("0098"))
            normalized = $"0{normalized[4..]}";

        return normalized.Length == 11 && normalized.StartsWith("09") && normalized.All(char.IsDigit)
            ? normalized
            : null;
    }

    private string HashVerificationCode(string phoneNumber, string code)
    {
        return Convert.ToHexString(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!),
            Encoding.UTF8.GetBytes($"otp:{phoneNumber}:{code}")));
    }
}
