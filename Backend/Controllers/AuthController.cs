using Microsoft.AspNetCore.Mvc;
using StoreBackend.Helpers;
using StoreBackend.Models;
using StoreBackend.Services.Contracts;
using StoreBackend.Services.Implementation;

namespace StoreBackend.Controllers;
[Route("api/[controller]")]
[ApiController]
public class AuthController(IUserService userService) : ControllerBase
{
    [HttpPost("Login")]
    public async Task<IActionResult> Login(LoginParameters parameters, CancellationToken cancellation)
    {
        var isValidUser = await userService.IsValidUser(parameters, cancellation);
        if (isValidUser)
        {
            var token = userService.GenerateJwtToken(parameters.Email);
            var result = new

            {
                Token = token
            };
            return Ok(ResponseHelper.Success(result));
        }
        return Unauthorized();
    }
    [HttpPost("Register")]
    public async Task<IActionResult> Register(UserCreateParameters parameters, CancellationToken cancellation)
    {
        var result = await userService.Create(parameters, cancellation);
        return Ok(ResponseHelper.Success(result));
    }
}
