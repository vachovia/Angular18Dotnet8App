using Api.DTOs.Account;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IJwtService _jwtService;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly UserManager<AppUser> _userManager;

        public AccountController(IJwtService jwtService, SignInManager<AppUser> signInManager, UserManager<AppUser> userManager)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpPost("Login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);

            if (user == null)
            {
                return Unauthorized("Invalid username or password");
            }

            if(user.EmailConfirmed == false)
            {
                return Unauthorized("Please confirm your email.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if(!result.Succeeded)
            {
                return Unauthorized("Invalid username or password.");
            }

            return CreateAppUserDto(user);
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var exists = await CheckEmailExistsAsync(model.Email);

            if(exists)
            {
                return BadRequest($"An existing account is {model.Email}, email address. Please try with anotheremail address.");
            }

            var userToAdd = new AppUser
            {
                FirstName = model.FirstName.ToLower(),
                LastName = model.LastName.ToLower(),
                UserName = model.Email.ToLower(),
                Email = model.Email.ToLower(),
                EmailConfirmed = true // to remove
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);            

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok("Your account has been created, you can login.");
        }

        // [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var userName = User.FindFirst(ClaimTypes.Email)?.Value;

            var user = await _userManager.FindByNameAsync(userName);

            var userDto = CreateAppUserDto(user);

            return userDto;
        }

        #region Private Help Methods

        private UserDto CreateAppUserDto(AppUser user)
        {
            return new UserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Jwt = _jwtService.CreateJwt(user)
            };
        }

        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            var exists = await _userManager.Users.AnyAsync(u => u.Email == email.ToLower());

            return exists;
        }

        #endregion
    }
}
