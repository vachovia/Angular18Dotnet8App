using Api.DTOs.Account;
using Api.Models;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
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

            var userDto = await CreateAppUserDto(user);

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

        [HttpPut("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if(user == null)
            {
                return Unauthorized("This email address has not been registered yet.");
            }

            if(user.EmailConfirmed == true)
            {
                return BadRequest("Your email was confirmed before. Please login to your account.");
            }

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);

                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new{ title = "Email confirmed", message = "Your email address is confirmed. You can login now." }));
                }

                return BadRequest("Invalid token. Please try again.");
            }
            catch(Exception)
            {
                return BadRequest("Invalid token. Please try again.");
            }
        }

        [HttpPost("resend-email-confirmation-link/{email}")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Invalid email.");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return Unauthorized("This email address has not been registered yet.");
            }

            if (user.EmailConfirmed == true)
            {
                return BadRequest("Your email was confirmed before. Please login to your account.");
            }

            try
            {
                var emailSent = await SendConfirmEmailAsync(user);

                if (emailSent)
                {
                    return Ok(new JsonResult(new { title = "Confirmation link sent.", message = "Please confirm your email address." }));
                }

                return BadRequest("Failed to send email. Please contact admin.");
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email. Please contact admin.");
            }
        }

        [HttpPost("forgot-username-or-password/{email}")]
        public async Task<IActionResult> ForgotUsernameOrPassword(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Invalid email.");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return Unauthorized("This email address has not been registered yet.");
            }

            if (user.EmailConfirmed == false)
            {
                return BadRequest("Please confirm your email address first.");
            }

            try
            {
                var emailSent = await SendForgotUsernameOrPasswordEmailAsync(user);

                if (emailSent)
                {
                    return Ok(new JsonResult(new { title = "Forgot username or password email sent.", message = "Please check your email." }));
                }

                return BadRequest("Failed to send email. Please contact admin.");
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email. Please contact admin.");
            }
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized("This email address has not been registered yet.");
            }

            if (user.EmailConfirmed == false)
            {
                return BadRequest("Please confirm your email address first.");
            }

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);

                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Password reset success", message = "Your password has been reset." }));
                }

                return BadRequest("Invalid token. Please try again.");
            }
            catch (Exception)
            {
                return BadRequest("Invalid token. Please try again.");
            }
        }

        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var userName = User.FindFirst(ClaimTypes.Email)?.Value;

            var user = await _userManager.FindByNameAsync(userName);

            var userDto = await CreateAppUserDto(user);

            return userDto;
        }

        #region Private Help Methods

        private async Task<UserDto> CreateAppUserDto(AppUser user)
        {
            return new UserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Jwt = await _jwtService.CreateJwt(user)
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

        private async Task<bool> SendForgotUsernameOrPasswordEmailAsync(AppUser user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var appUrl = _config["Jwt:ClientUrl"];
            var appName = _config["Jwt:ApplicationName"];
            var resetPath = _config["Email:ResetPasswordPath"];

            var url = $"{appUrl}/{resetPath}?token={token}&email={user.Email}";

            var body = $"<p>Hello {user.FirstName} {user.LastName}</p>" +
                       $"<p>Username: {user.UserName}.</p>" +
                       "<p>In order to reset your password, please click on the following link</p>" +
                       $"<p><a href=\"{url}\">Click here</a></p>" +
                       "<p>Thank you,</p>" +
                       $"<br/>{appName}";

            var emailSendDto = new EmailSendDto(user.Email, "Forgot username or password", body);

            return await _emailService.SendAsync(emailSendDto);
        }

        #endregion
    }
}
