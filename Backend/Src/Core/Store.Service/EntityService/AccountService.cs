using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;
using Store.Domain.Invoices;
using Store.Service.ProviderService;

namespace Store.Service.EntityService;

public class AccountService(
    IAccountRepository accountRepository,
    IConfiguration configuration,
    KavenegarSmsService smsService,
    ILogger<AccountService> logger
)
{
    private readonly RoleService roleService = new(accountRepository);

    public async Task<Result<UserListPageOutput>> UserListAsync(UserListInput input,
        CancellationToken cancellation)
    {
        var entities = await accountRepository.UserListAsync(input, cancellation);
        var items = entities.Items.Select(x => new UserListOutput
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
        var result = new UserListPageOutput
        {
            TotalCount = entities.TotalCount,
            Items = items
        };
        return Result<UserListPageOutput>.Success(result);
    }

    public async Task<Result<UserGetOutput>> UserGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<UserGetOutput>.Failure("کاربر یافت نشد");
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
            return Result<UserProfileGetOutput>.Failure("کاربر یافت نشد");
        }

        var result = new UserProfileGetOutput
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            BirthDate = entity.BirthDate,
            Address = entity.Address,
            PostalCode = entity.PostalCode,
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
            return Result<UserProfileUpdateOutput>.Failure("کاربر یافت نشد");

        if (string.IsNullOrWhiteSpace(input.FirstName))
            return Result<UserProfileUpdateOutput>.Failure("وارد کردن نام الزامی است");

        if (string.IsNullOrWhiteSpace(input.LastName))
            return Result<UserProfileUpdateOutput>.Failure("وارد کردن نام خانوادگی الزامی است");

        var email = string.IsNullOrWhiteSpace(input.Email) ? null : input.Email.Trim();
        if (email != null && !string.Equals(email, entity.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailOwner = await accountRepository.UserGetByEmailAsync(email, cancellation);
            if (emailOwner != null && emailOwner.Id != id)
                return Result<UserProfileUpdateOutput>.Failure("این ایمیل قبلاً استفاده شده است");
            entity.IsEmailVerified = false;
        }

        entity.FirstName = input.FirstName.Trim();
        entity.LastName = input.LastName.Trim();
        entity.Email = email;
        entity.Address = input.Address;
        entity.PostalCode = string.IsNullOrWhiteSpace(input.PostalCode) ? null : input.PostalCode.Trim();
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
            PostalCode = updated.PostalCode,
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
            return Result<UserOtpSendOutput>.Failure("شماره تلفن نامعتبر است");

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
            return Result<UserOtpSendOutput>.Failure("لطفاً پیش از درخواست مجدد کد تأیید کمی صبر کنید");

        await smsService.SendVerificationCodeAsync(phoneNumber, code, cancellation);

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
            return Result<UserOtpVerifyOutput>.Failure("شماره تلفن یا کد تأیید نامعتبر است");

        var verificationCode = await accountRepository.VerificationCodeGetAsync(phoneNumber, cancellation);
        if (verificationCode == null || verificationCode.ExpiresAt <= DateTime.UtcNow ||
            verificationCode.Code != input.Code)
            return Result<UserOtpVerifyOutput>.Failure("کد تأیید نامعتبر است یا منقضی شده است");

        var authentication = await accountRepository.VerificationCodeUseAsync(
            verificationCode.Id,
            phoneNumber,
            "User",
            cancellation);

        if (authentication == null)
            return Result<UserOtpVerifyOutput>.Failure("کد تأیید نامعتبر است یا منقضی شده است");

        var (user, isNewUser) = authentication.Value;

        if (isNewUser)
            await CreateWelcomeDiscountAsync(user, cancellation);

        return Result<UserOtpVerifyOutput>.Success(new UserOtpVerifyOutput
        {
            Id = user.Id,
            PhoneNumber = user.PhoneNumber,
            IsNewUser = isNewUser,
            Token = GenerateToken(user.Id)
        });
    }

    public async Task<Result<List<RoleListOutput>>> RoleListAsync(CancellationToken cancellation) =>
        await roleService.RoleListAsync(cancellation);

    public async Task<Result<RoleCreateOutput>> RoleCreateAsync(RoleCreateInput input, CancellationToken cancellation) =>
        await roleService.RoleCreateAsync(input, cancellation);

    public async Task<Result<RoleUpdateOutput>> RoleUpdateAsync(int id, RoleUpdateInput input,
        CancellationToken cancellation) =>
        await roleService.RoleUpdateAsync(id, input, cancellation);

    public async Task<Result<bool>> RoleDeleteAsync(int id, CancellationToken cancellation) =>
        await roleService.RoleDeleteAsync(id, cancellation);

    public async Task<Result<UserRoleCreateOutput>> UserRoleCreateAsync(UserRoleCreateInput input,
        CancellationToken cancellation) =>
        await roleService.UserRoleCreateAsync(input, cancellation);

    public async Task<Result<bool>> UserRoleDeleteAsync(int id, CancellationToken cancellation) =>
        await roleService.UserRoleDeleteAsync(id, cancellation);

    public async Task<Result<List<DiscountCodeListOutput>>> DiscountCodeListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.DiscountCodeListAsync(cancellation);
        var result = entities.Select(x => new DiscountCodeListOutput
        {
            Id = x.Id,
            Code = x.Code,
            MaxDiscountAmount = x.MaxDiscountAmount,
            MinimumPurchaseAmount = x.MinimumPurchaseAmount,
            PaymentMethod = x.PaymentMethod,
            ExpireAt = x.ExpireAt,
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
            ? Result<DiscountCodeOutput>.Failure("کد تخفیف یافت نشد")
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
            return Result<DiscountCodeOutput>.Failure("این کد تخفیف از قبل وجود دارد");

        var usersResult = await GetDiscountCodeUsersAsync(input.UserIds, cancellation);
        if (usersResult.Error != null)
            return Result<DiscountCodeOutput>.Failure(usersResult.Error);

        var entity = new DiscountCodeEntity
        {
            Code = code,
            MaxDiscountAmount = input.MaxDiscountAmount,
            MinimumPurchaseAmount = input.MinimumPurchaseAmount,
            PaymentMethod = input.PaymentMethod,
            ExpireAt = input.ExpireAt,
            IsActive = input.IsActive,
            UserDiscountCodes = usersResult.Users.Select(user => new UserDiscountCodeEntity
            {
                UserId = user.Id,
                User = user,
                IsUsed = false
            }).ToList()
        };

        var created = await accountRepository.DiscountCodeCreateAsync(entity, cancellation);
        foreach (var user in usersResult.Users)
        {
            try
            {
                await smsService.SendAssignedDiscountAsync(user.PhoneNumber, created.Code,
                    created.MaxDiscountAmount, created.MinimumPurchaseAmount, created.ExpireAt, cancellation);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception,
                    "Sending discount code {DiscountCodeId} to user {UserId} failed", created.Id, user.Id);
            }
        }

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
            return Result<DiscountCodeOutput>.Failure("کد تخفیف یافت نشد");

        var code = input.Code.Trim();
        if (await accountRepository.DiscountCodeExistsAsync(code, id, cancellation))
            return Result<DiscountCodeOutput>.Failure("این کد تخفیف از قبل وجود دارد");

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
        entity.MaxDiscountAmount = input.MaxDiscountAmount;
        entity.MinimumPurchaseAmount = input.MinimumPurchaseAmount;
        entity.PaymentMethod = input.PaymentMethod;
        entity.ExpireAt = input.ExpireAt;
        entity.IsActive = input.IsActive;

        var updated = await accountRepository.DiscountCodeUpdateAsync(entity, cancellation);
        return Result<DiscountCodeOutput>.Success(MapDiscountCode(updated));
    }

    public async Task<Result<bool>> DiscountCodeDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.DiscountCodeGetAsync(id, cancellation);
        if (entity == null)
            return Result<bool>.Failure("کد تخفیف یافت نشد");

        if (await accountRepository.DiscountCodeIsUsedAsync(id, cancellation))
            return Result<bool>.Failure("این کد تخفیف در یک فاکتور استفاده شده و قابل حذف نیست");

        await accountRepository.DiscountCodeDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<RoleAccessListOutput>>> RoleAccessListAsync(
        int roleId,
        CancellationToken cancellation
    ) => await roleService.RoleAccessListAsync(roleId, cancellation);

    public async Task<Result<RoleAccessCreateOutput>> RoleAccessCreateAsync(RoleAccessCreateInput input,
        CancellationToken cancellation) =>
        await roleService.RoleAccessCreateAsync(input, cancellation);

    public async Task<Result<bool>> RoleAccessDeleteAsync(int id, CancellationToken cancellation) =>
        await roleService.RoleAccessDeleteAsync(id, cancellation);

    private async Task CreateWelcomeDiscountAsync(UserEntity user, CancellationToken cancellation)
    {
        var amount = configuration.GetValue<decimal>("WelcomeDiscount:AmountToman");
        var minimumPurchase = configuration.GetValue<decimal>("WelcomeDiscount:MinimumPurchaseAmountToman");
        var validityDays = configuration.GetValue<int>("WelcomeDiscount:ValidityDays");
        if (amount <= 0 || minimumPurchase < 0 || validityDays <= 0)
        {
            logger.LogError("Welcome discount configuration is invalid");
            return;
        }

        var expireAt = DateTime.UtcNow.AddDays(validityDays);
        var code = $"WELCOME{user.Id}{RandomNumberGenerator.GetInt32(100000, 1000000)}";

        try
        {
            await accountRepository.DiscountCodeCreateAsync(new DiscountCodeEntity
            {
                Code = code,
                MaxDiscountAmount = amount,
                MinimumPurchaseAmount = minimumPurchase,
                PaymentMethod = PaymentMethodEnum.Online,
                ExpireAt = expireAt,
                IsActive = true,
                UserDiscountCodes =
                [
                    new UserDiscountCodeEntity
                    {
                        UserId = user.Id,
                        IsUsed = false
                    }
                ]
            }, cancellation);

            await smsService.SendWelcomeDiscountAsync(user.PhoneNumber, code, amount, minimumPurchase, expireAt,
                cancellation);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "Creating or sending welcome discount failed for user {UserId}", user.Id);
        }
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
            return ([], "یک یا چند کاربر یافت نشدند");

        return (users, null);
    }

    private static string? ValidateDiscountCode(DiscountCodeUpsertInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Code))
            return "وارد کردن کد تخفیف الزامی است";
        if (input.Code.Trim().Length > 100)
            return "کد تخفیف نمی‌تواند بیش از ۱۰۰ نویسه باشد";
        if (input.MaxDiscountAmount <= 0)
            return "مبلغ تخفیف باید بیشتر از صفر باشد";
        if (input.MinimumPurchaseAmount < 0)
            return "حداقل مبلغ خرید نمی‌تواند منفی باشد";
        if (input.PaymentMethod.HasValue && !Enum.IsDefined(input.PaymentMethod.Value))
            return "روش پرداخت نامعتبر است";
        if (input.UserIds == null || input.UserIds.Count == 0)
            return "باید حداقل یک کاربر انتخاب شود";
        if (input.UserIds.Any(x => x <= 0))
            return "شناسه کاربر نامعتبر است";
        return null;
    }

    private static DiscountCodeOutput MapDiscountCode(DiscountCodeEntity entity)
    {
        return new DiscountCodeOutput
        {
            Id = entity.Id,
            Code = entity.Code,
            MaxDiscountAmount = entity.MaxDiscountAmount,
            MinimumPurchaseAmount = entity.MinimumPurchaseAmount,
            PaymentMethod = entity.PaymentMethod,
            ExpireAt = entity.ExpireAt,
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
