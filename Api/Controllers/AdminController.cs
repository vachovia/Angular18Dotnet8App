using Api.DTOs.Admin;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = SD.AdminRole)]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("get-members")]
        public async Task<ActionResult<IEnumerable<MemberViewDto>>> GetMembers()
        {
            List<MemberViewDto> members = new();

            var users = await _userManager.Users.Where(u => u.UserName != SD.AdminEmail).ToListAsync();

            foreach (var user in users)
            {
                var member = new MemberViewDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateCreated = user.DateCreated,
                    Roles = await _userManager.GetRolesAsync(user),
                    IsLocked = await _userManager.IsLockedOutAsync(user),
                    // IsLocked = _userManager.IsLockedOutAsync(member).GetAwaiter().GetResult(),
                    // Azure doesn't like ? GetAwaiter() when we do users.Select(user => new MemberViewDto {...})                  
                };
                members.Add(member);
            }

            return Ok(members);
        }

        [HttpGet("get-member/{id}")]
        public async Task<ActionResult<MemberAddEditDto>> GetMember(string id)
        {
            var user = await _userManager.Users.Where(u => u.UserName != SD.AdminEmail && u.Id == id).FirstOrDefaultAsync();

            var member = new MemberAddEditDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = string.Join(",", await _userManager.GetRolesAsync(user)),
            };

            return Ok(member);
        }

        [HttpPost("add-edit-member")]
        public async Task<IActionResult> AddEditMember(MemberAddEditDto model)
        {
            AppUser user;

            if (string.IsNullOrEmpty(model.Id))
            {
                if(string.IsNullOrEmpty(model.Password) || model.Password.Length < 8 || model.Password.Length > 15)
                {
                    ModelState.AddModelError("Errors", string.Format("Password must be at least {0}, and maximum {1} characters", 8, 15));

                    return BadRequest(ModelState);
                }

                user = new AppUser
                {
                    FirstName = model.FirstName.ToLower(),
                    LastName = model.LastName.ToLower(),
                    UserName = model.UserName.ToLower(),
                    Email = model.UserName.ToLower(),
                    EmailConfirmed = true,

                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(model.Password) && (model.Password.Length < 8 || model.Password.Length > 15))
                {
                    ModelState.AddModelError("Errors", string.Format("Password must be at least {0}, and maximum {1} characters", 8, 15));

                    return BadRequest(ModelState);
                }

                bool isAdmin = IsAdminUserId(model.Id);

                if (isAdmin)
                {
                    return BadRequest(SD.SuperAdminChangeIsNotAllowed);
                }

                user = await _userManager.FindByIdAsync(model.Id);

                if(user is null)
                {
                    return NotFound();
                }

                user.FirstName = model.FirstName.ToLower();
                user.LastName = model.LastName.ToLower();
                user.UserName = model.UserName.ToLower();
                user.Email = model.UserName.ToLower();
               
                if(!string.IsNullOrEmpty(model.Password))
                {
                    await _userManager.RemovePasswordAsync(user);

                    await _userManager.AddPasswordAsync(user, model.Password);
                }
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            await _userManager.RemoveFromRolesAsync(user, userRoles);

            foreach (var role in model.Roles.Split(",").ToArray())
            {
                var roleToAdd = await _roleManager.Roles.FirstOrDefaultAsync(r => r.Name == role);

                if (roleToAdd != null)
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
            }

            if(string.IsNullOrEmpty(model.Id))
            {
                return Ok(new JsonResult(new { title = "Member Created", message = $"{model.UserName} has been created." }));
            }

            return Ok(new JsonResult(new { title = "Member Edited", message = $"{model.UserName} has been updated." }));
        }

        [HttpPut("lock-member/{id}")]
        public async Task<IActionResult> LockMember(string id)
        {
           var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            bool isAdmin = IsAdminUserId(id);

            if(isAdmin)
            {
                return BadRequest(SD.SuperAdminChangeIsNotAllowed);
            }

            await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddMinutes(30));

            return NoContent();
        }

        [HttpPut("unlock-member/{id}")]
        public async Task<IActionResult> UnlockMember(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            bool isAdmin = IsAdminUserId(id);

            if (isAdmin)
            {
                return BadRequest(SD.SuperAdminChangeIsNotAllowed);
            }

            await _userManager.SetLockoutEndDateAsync(user, null);

            return NoContent();
        }

        [HttpDelete("delete-member/{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            bool isAdmin = IsAdminUserId(id);

            if (isAdmin)
            {
                return BadRequest(SD.SuperAdminChangeIsNotAllowed);
            }

            await _userManager.DeleteAsync(user);

            return NoContent();
        }
        
        [HttpGet("get-application-roles")]
        public async Task<ActionResult<string[]>> GetApplicationRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();

            return Ok(roles);
        }        

        #region Private Helper Methods

        private bool IsAdminUserId(string userId)
        {
            bool isAdmin = _userManager.FindByIdAsync(userId).GetAwaiter().GetResult().UserName.Equals(SD.AdminEmail);

            return isAdmin;
        }

        #endregion
    }
}
