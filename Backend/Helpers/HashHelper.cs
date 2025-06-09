using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace StoreBackend.Helpers;


public static class HashHelper
{
    private static string? _hasKey;


    public static string HashSHA256(string str, IConfiguration configuration)
    {
        _hasKey = configuration.GetConnectionString("PasswordHashKey");

        if (string.IsNullOrEmpty(_hasKey))
        {
            throw new Exception("HashKey is not configured in appsettings.json!");
        }
        using var sha256 = SHA256.Create();

        var combinedPassword = str + _hasKey;
        var bytes = Encoding.UTF8.GetBytes(combinedPassword);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);

    }
    public static string HashSHA512(string str, IConfiguration configuration)
    {
        _hasKey = configuration.GetConnectionString("PasswordHashKey");

        if (string.IsNullOrEmpty(_hasKey))
        {
            throw new Exception("HashKey is not configured in appsettings.json!");
        }
        using var sha512 = SHA512.Create();

        var combinedPassword = str + _hasKey;
        var bytes = Encoding.UTF8.GetBytes(combinedPassword);
        var hash = sha512.ComputeHash(bytes);
        return Convert.ToBase64String(hash);

    }

}
