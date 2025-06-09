using System.ComponentModel.DataAnnotations;

namespace StoreBackend.Models;

public class LoginParameters
{
    public string Email { get; set; }
    public string Password { get; set; }
}
