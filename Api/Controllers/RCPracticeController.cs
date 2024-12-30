using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RCPracticeController : ControllerBase
    {
        #region Public Access

        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("public");
        }

        #endregion

        #region Role Access

        [Authorize(Roles = SD.ManagerRole)]
        [HttpGet("admin-role")]
        public IActionResult AdminRole()
        {
            return Ok("admin role");
        }

        [Authorize(Roles = SD.ManagerRole)]
        [HttpGet("manager-role")]
        public IActionResult ManagerRole()
        {
            return Ok("manager role");
        }

        [Authorize(Roles = SD.PlayerRole)]
        [HttpGet("player-role")]
        public IActionResult PlayerRole()
        {
            return Ok("player role");
        }

        [Authorize(Roles = $"{SD.AdminRole},{SD.ManagerRole}")]
        [HttpGet("admin-or-manager-role")]
        public IActionResult AdminOrManagerRole()
        {
            return Ok("admin or manager role");
        }

        [Authorize(Roles = $"{SD.AdminRole},{SD.PlayerRole}")]
        [HttpGet("admin-or-player-role")]
        public IActionResult AdminOrPlayerRole()
        {
            return Ok("admin or player role");
        }

        #endregion

        #region Policy Access

        [HttpGet("admin-policy")]
        [Authorize(policy:SD.AdminPolicy)]
        public IActionResult AdminPolicy()
        {
            return Ok("admin policy");
        }

        [HttpGet("manager-policy")]
        [Authorize(policy: SD.ManagerPolicy)]
        public IActionResult ManagerPolicy()
        {
            return Ok("manager policy");
        }

        [HttpGet("player-policy")]
        [Authorize(policy: SD.PlayerPolicy)]
        public IActionResult PlayerPolicy()
        {
            return Ok("player policy");
        }

        [HttpGet("admin-or-manager-policy")]
        [Authorize(policy: SD.AdminOrManagerPolicy)]
        public IActionResult AdminOrManagerPolicy()
        {
            return Ok("admin or manager policy");
        }

        [HttpGet("admin-and-manager-policy")]
        [Authorize(policy: SD.AdminAndManagerPolicy)]
        public IActionResult AdminAndManagerPolicy()
        {
            return Ok("admin and manager policy");
        }

        [HttpGet("all-role-policy")]
        [Authorize(policy: SD.AllRolePolicy)]
        public IActionResult AllRolePolicy()
        {
            return Ok("all role policy");
        }

        #endregion

        #region Claim Access

        [HttpGet("admin-email-policy")]
        [Authorize(policy: SD.AdminEmailPolicy)]
        public IActionResult AdminEmailPolicy()
        {
            return Ok("admin email policy");
        }

        [HttpGet("miller-surname-policy")]
        [Authorize(policy: SD.MillerSurnamePolicy)]
        public IActionResult MillerSurnamePolicy()
        {
            return Ok("miller surname policy");
        }

        [HttpGet("manager-email-and-wilson-surname-policy")]
        [Authorize(policy: SD.ManagerEmailAndWilsonSurnamePolicy)]
        public IActionResult ManagerEmailAndWilsonSurnamePolicy()
        {
            return Ok("manager email and wilson surname policy");
        }

        [HttpGet("vip-policy")]
        [Authorize(policy: SD.VipPolicy)]
        public IActionResult VipPolicy()
        {
            return Ok("vip policy");
        }

        #endregion
    }
}
