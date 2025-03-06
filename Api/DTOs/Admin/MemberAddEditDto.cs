using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Admin
{
    public class MemberAddEditDto
    {
        public string Id { get; set; } = string.Empty;

        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string Password { get; set; }

        [Required] // eg: "Admin,Player,Manager"
        public string Roles { get; set; } = string.Empty;
    }
}
