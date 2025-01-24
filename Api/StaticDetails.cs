using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Api
{
    public static class SD
    {
        public const string AdminRole = "Admin";
        public const string ManagerRole = "Manager";
        public const string PlayerRole = "Player";
        public const string AdminPolicy = "AdminPolicy";
        public const string ManagerPolicy = "ManagerPolicy";
        public const string PlayerPolicy = "PlayerPolicy";
        public const string AllRolePolicy = "AllRolePolicy";
        public const string AdminOrManagerPolicy = "AdminOrManagerPolicy";
        public const string AdminAndManagerPolicy = "AdminAndManagerPolicy";
        public const string AdminEmail = "admin@example.com";
        public const string AdminEmailPolicy = "AdminEmailPolicy";
        public const string MillerSurname = "Miller";
        public const string MillerSurnamePolicy = "MillerSurnamePolicy";
        public const string WilsonSurname = "Wilson";
        public const string ManagerEmail = "manager@example.com";
        public const string ManagerEmailAndWilsonSurnamePolicy = "ManagerEmailAndWilsonSurnamePolicy";
        public const string VipPolicy = "VipPolicy";
        public const string SuperAdminChangeIsNotAllowed = "Super Admin change is not allowed!";
        public const int MaximumLoginAttempts = 3;
        public const string IdentityAppRefreshToken = "IdentityAppRefreshToken";

        public static bool VipPolicyCheck(AuthorizationHandlerContext context)
        {
            var isVip = context.User.IsInRole(PlayerRole) && context.User.HasClaim(c => c.Type == ClaimTypes.Email && c.Value.Contains("vip"));

            return isVip;
        }
    }
}
