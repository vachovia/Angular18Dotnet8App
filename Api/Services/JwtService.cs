using Api.Models;
using System;
using System.Text;
using System.Security.Claims;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace Api.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _jwtKey;
        private readonly UserManager<AppUser> _userManager;

        public JwtService(IConfiguration config, UserManager<AppUser> userManager)
        {
            _config = config;
            _userManager = userManager;
            _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        }

        public async Task<string> CreateJwt(AppUser user)
        {
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
            };

            var roles = await _userManager.GetRolesAsync(user);
            userClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var credentials = new SigningCredentials(_jwtKey, SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(userClaims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresInMins"])),
                SigningCredentials = credentials,
                Issuer = _config["Jwt:Issuer"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwt = tokenHandler.CreateToken(tokenDescriptor);

            var token = tokenHandler.WriteToken(jwt);

            return token;
        }

        public RefreshToken CreateRefreshToken(AppUser user)
        {
            var token = new byte[32];
            using var randomNoGenerator = RandomNumberGenerator.Create();
            randomNoGenerator.GetBytes(token);

            int refreshTokenDays = int.Parse(_config["Jwt:RefreshTokenExpiresInDays"]);

            var refreshToken = new RefreshToken()
            {
                Token = Convert.ToBase64String(token),
                AppUser = user,
                DateExpiresUtc = DateTime.UtcNow.AddDays(refreshTokenDays),
            };

            return refreshToken;
        }
    }
}
