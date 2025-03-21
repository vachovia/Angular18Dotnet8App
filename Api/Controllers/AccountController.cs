﻿using Api.Data;
using Api.DTOs.Account;
using Api.Models;
using Api.Services.Interfaces;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
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
        private readonly AppDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IHttpClientFactory _httpClientFactory;

        public AccountController(IJwtService jwtService, SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, IEmailService emailService, IConfiguration config, IHttpClientFactory httpClientFactory, AppDbContext dbContext)
        {
            _config = config;
            _dbContext = dbContext;
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _httpClientFactory = httpClientFactory;
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

            if(result.IsLockedOut)
            {
                return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login.", user.LockoutEnd));
            }

            if(!result.Succeeded)
            {
                if(!user.UserName.Equals(SD.AdminEmail))
                {
                    await _userManager.AccessFailedAsync(user);
                }

                if(user.AccessFailedCount >= SD.MaximumLoginAttempts)
                {
                    await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddMinutes(1));

                    return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login.", user.LockoutEnd));
                }

                return Unauthorized("Invalid username or password.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            await _userManager.SetLockoutEndDateAsync(user, null);

            var userDto = await CreateAppUserDto(user);

            return userDto;
        }

        [HttpPost("login-with-third-party")]
        public async Task<ActionResult<UserDto>> LoginWithThirdParty(LoginWithExternalDto model)
        {
            if (model.Provider.Equals(SD.Facebook))
            {
                try
                {
                    if (!FacebookValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to login with facebook");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to login with facebook");
                }
            }
            else if (model.Provider.Equals(SD.Google))
            {
                try
                {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to login with google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to login with google");
                }
            }
            else
            {
                return BadRequest("Invalid provider");
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == model.UserId && x.Provider == model.Provider);

            if (user == null)
            {
                return Unauthorized("Unable to find your account");
            } 

            return await CreateAppUserDto(user);
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

            await _userManager.AddToRoleAsync(userToAdd, SD.PlayerRole);

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

        [HttpPost("register-with-third-party")]
        public async Task<ActionResult<UserDto>> RegisterWithThirdParty(RegisterWithExternalDto model)
        {
            if (model.Provider.Equals(SD.Facebook))
            {
                try
                {
                    if (!FacebookValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to register with facebook");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to register with facebook");
                }
            }
            else if (model.Provider.Equals(SD.Google))
            {
                try
                {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to register with google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to register with google");
                }
            }
            else
            {
                return BadRequest("Invalid provider");
            }

            var user = await _userManager.FindByNameAsync(model.UserId);

            if (user != null)
            {
                return BadRequest(string.Format("You have an account already. Please login with your {0}", model.Provider));
            }

            var userToAdd = new AppUser
            {
                FirstName = model.FirstName.ToLower(),
                LastName = model.LastName.ToLower(),
                UserName = model.UserId,
                Provider = model.Provider,
                Email = model.Provider.Equals(SD.Facebook) ? $"{model.UserId}@facebook.com" : $"{model.UserId}@google.com" // nullable field but...
                // Required Unique Email so why cannot save when email is null
            };

            var result = await _userManager.CreateAsync(userToAdd);

            if (!result.Succeeded)
            {
                return BadRequest(string.Join(",", result.Errors.Select(e => e.Description).ToList()));
            }

            await _userManager.AddToRoleAsync(userToAdd, SD.PlayerRole);

            return await CreateAppUserDto(userToAdd);
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
        [HttpPost("refresh-token")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var token = Request.Cookies[SD.IdentityAppRefreshToken];

            var isValidToken = await IsValidRefreshTokenAsync(userId, token);

            if (isValidToken)
            {
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                {
                    return Unauthorized("Invalid or expired token, please try to login.");
                }

                var userDto = await CreateAppUserDto(user);

                return userDto;
            }

            return Unauthorized("Invalid or expired token, please try to login.");
        }

        [Authorize]
        [HttpGet("refresh-page")]
        public async Task<ActionResult<UserDto>> RefreshPage()
        {
            var userName = User.FindFirst(ClaimTypes.Email)?.Value;

            var user = await _userManager.FindByEmailAsync(userName);

            var isUserLocked = await _userManager.IsLockedOutAsync(user);

            if (isUserLocked)
            {
                return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login.", user.LockoutEnd));
            }

            var userDto = await CreateAppUserDto(user);

            return userDto;
        }

        #region Depricated Endpoint
        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var userName = User.FindFirst(ClaimTypes.Email)?.Value;

            var user = await _userManager.FindByNameAsync(userName);

            var isUserLocked = await _userManager.IsLockedOutAsync(user);

            if (isUserLocked)
            {
                return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login.", user.LockoutEnd));
            }

            var userDto = await CreateAppUserDto(user);

            return userDto;
        }
        #endregion

        #region Private Helper Methods

        private async Task<UserDto> CreateAppUserDto(AppUser user)
        {
            await SaveRefreshTokenAsync(user);

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

        private async Task SaveRefreshTokenAsync(AppUser user)
        {
            var refreshToken = _jwtService.CreateRefreshToken(user);

            var existingRefreshToken = await _dbContext.RefreshTokens.SingleOrDefaultAsync(t => t.UserId == user.Id);

            if(existingRefreshToken is not null)
            {
                existingRefreshToken.Token = refreshToken.Token;
                existingRefreshToken.DateCreatedUtc = refreshToken.DateCreatedUtc;
                existingRefreshToken.DateExpiresUtc = refreshToken.DateExpiresUtc;
            }
            else
            {
                user.RefreshTokens.Add(refreshToken);
            }

            await _dbContext.SaveChangesAsync();

            var cookieOptions = new CookieOptions
            {
                Expires = refreshToken.DateExpiresUtc,
                IsEssential = true,
                HttpOnly = true, // only server side has access to cookie
            };

            Response.Cookies.Append(SD.IdentityAppRefreshToken, refreshToken.Token, cookieOptions);
        }

        public async Task<bool> IsValidRefreshTokenAsync(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token)) return false;

            var fetchRefreshToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(t => t.UserId == userId && t.Token == token);

            if (fetchRefreshToken is null) return false;

            if(fetchRefreshToken.IsExpired) return false;

            return true;
        }

        private async Task<bool> FacebookValidatedAsync(string accessToken, string userId)
        {
            var facebookKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];

            // var _facebookHttpClient = _httpClientFactory.CreateClient("FacebookAPI");

            var _facebookHttpClient = _httpClientFactory.CreateClient();
            _facebookHttpClient.BaseAddress = new Uri("https://graph.facebook.com");

            var fbResult = await _facebookHttpClient.GetFromJsonAsync<FacebookResultDto>($"debug_token?input_token={accessToken}&access_token={facebookKeys}");

            if (fbResult == null || fbResult.Data.Is_Valid == false || !fbResult.Data.User_Id.Equals(userId))
            {
                return false;
            }

            return true;
        }

        private async Task<bool> GoogleValidatedAsync(string accessToken, string userId)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken);

            if (!payload.Audience.Equals(_config["Google:ClientId"]))
            {
                return false;
            }

            if (!payload.Issuer.Equals("accounts.google.com") && !payload.Issuer.Equals("https://accounts.google.com"))
            {
                return false;
            }

            if (payload.ExpirationTimeSeconds == null)
            {
                return false;
            }

            DateTime now = DateTime.Now.ToUniversalTime();

            DateTime expiration = DateTimeOffset.FromUnixTimeSeconds((long)payload.ExpirationTimeSeconds).DateTime;

            if (now > expiration)
            {
                return false;
            }

            if (!payload.Subject.Equals(userId))
            {
                return false;
            }

            return true;
        }

        #endregion
    }
}
