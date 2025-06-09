using System.ComponentModel.DataAnnotations;

namespace StoreBackend.Models;

public class UserCreateParameters
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}
