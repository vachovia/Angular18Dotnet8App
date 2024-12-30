using Api.Data;
using Api.Models;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Services
{
    public class ContextSeedService : IContextSeedService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public ContextSeedService(AppDbContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task InitializeContextAsync()
        {
            var pendingCount = _context.Database.GetPendingMigrationsAsync().GetAwaiter().GetResult().Count();

            if (pendingCount > 0)
            {
                // Applies for any pending migration
                await _context.Database.MigrateAsync();
            }

            var anyRole = _roleManager.Roles.Any();
            // var anyRole = _roleManager.Roles.AnyAsync().GetAwaiter().GetResult();

            if (!anyRole)
            {
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Name = SD.AdminRole
                });
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Name = SD.ManagerRole
                });
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Name = SD.PlayerRole
                });
            }

            var anyUser = _userManager.Users.AnyAsync().GetAwaiter().GetResult();

            if (!anyUser)
            {
                var admin = new AppUser
                {
                    FirstName = "Admin",
                    LastName = "Jackson",
                    UserName = "admin@example.com",
                    Email = "admin@example.com",
                    EmailConfirmed = true,
                };

                await _userManager.CreateAsync(admin, "P@ssword1");

                await _userManager.AddToRolesAsync(admin, [
                    SD.AdminRole,
                    SD.ManagerRole,
                    SD.PlayerRole
                ]);

                await _userManager.AddClaimsAsync(admin,
                [
                    new Claim(ClaimTypes.Email, admin.Email),
                    new Claim(ClaimTypes.Surname, admin.LastName),
                ]);

                var manager = new AppUser
                {
                    FirstName = "Manager",
                    LastName = "Wilson",
                    UserName = "manager@example.com",
                    Email = "manager@example.com",
                    EmailConfirmed = true,
                };

                await _userManager.CreateAsync(manager, "P@ssword1");

                await _userManager.AddToRoleAsync(manager, SD.ManagerRole);

                await _userManager.AddClaimsAsync(manager,
                [
                    new Claim(ClaimTypes.Email, manager.Email),
                    new Claim(ClaimTypes.Surname, manager.LastName),
                ]);

                var player = new AppUser
                {
                    FirstName = "Player",
                    LastName = "Miller",
                    UserName = "player@example.com",
                    Email = "player@example.com",
                    EmailConfirmed = true,
                };

                await _userManager.CreateAsync(player, "P@ssword1");

                await _userManager.AddToRoleAsync(player, SD.PlayerRole);

                await _userManager.AddClaimsAsync(player,
                [
                    new Claim(ClaimTypes.Email, player.Email),
                    new Claim(ClaimTypes.Surname, player.LastName),
                ]);

                var vipPlayer = new AppUser
                {
                    FirstName = "VipPlayer",
                    LastName = "Tomson",
                    UserName = "vipplayer@example.com",
                    Email = "vipplayer@example.com",
                    EmailConfirmed = true,
                };

                await _userManager.CreateAsync(vipPlayer, "P@ssword1");

                await _userManager.AddToRoleAsync(vipPlayer, SD.PlayerRole);

                await _userManager.AddClaimsAsync(vipPlayer,
                [
                    new Claim(ClaimTypes.Email, vipPlayer.Email),
                    new Claim(ClaimTypes.Surname, vipPlayer.LastName),
                ]);
            }
        }
    }
}
