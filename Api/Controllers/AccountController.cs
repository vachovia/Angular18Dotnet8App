using Api.DTOs.Account;
using Api.Models;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;        

        public AccountController(IJwtService jwtService, SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, IEmailService emailService, IConfiguration config)
        {
            _config = config;
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
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

            var userDto = CreateAppUserDto(user);

            return userDto;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var exists = await CheckEmailExistsAsync(model.Email);

            if(exists)
            {
                return BadRequest($"An existing account is using {model.Email} email address. Please try with another email address.");
            }

            var userToAdd = new AppUser
            {
                FirstName = model.FirstName.ToLower(),
                LastName = model.LastName.ToLower(),
                UserName = model.Email.ToLower(),
                Email = model.Email.ToLower(),
                // EmailConfirmed = true // to remove after adding email confirmation logic
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);            

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Added to confirm email address
            try
            {
                var emailSent = await SendConfirmEmailAsync(userToAdd);

                if (emailSent)
                {
                    return Ok(new JsonResult(new { title = "Account Created", message = "Your account has been created, please confirm your email address." }));
                }

                return BadRequest("Failed to send email. Please contact admin.");
            }
            catch(Exception)
            {
                return BadRequest("Failed to send email. Please contact admin.");
            }

            // return Ok(new JsonResult(new { title = "Account Created", message = "Your account has been created, you can login." }));
        }

        [Authorize]
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
            var isEmailFound = await _userManager.Users.AnyAsync(u => u.Email == email.ToLower());

            return isEmailFound;
        }

        private async Task<bool> SendConfirmEmailAsync(AppUser user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var appUrl = _config["Jwt:ClientUrl"];
            var appName = _config["Jwt:ApplicationName"];
            var emailPath = _config["Email:ConfirmEmailPath"];            

            var url = $"{appUrl}/{emailPath}?token={token}&email={user.Email}";

            var body = $"<p>Hello {user.FirstName} {user.LastName}</p>" +
                       "<p>Please confirm your email address by clicking on the following link</p>" +
                       $"<p><a href=\"{url}\">Click here</a></p>" +
                       "<p>Thank you,</p>" +
                       $"<br/>{appName}";

            var emailSendDto = new EmailSendDto(user.Email, "Confirm your email", body);

            return await _emailService.SendAsync(emailSendDto);
        }

        #endregion
    }
}
