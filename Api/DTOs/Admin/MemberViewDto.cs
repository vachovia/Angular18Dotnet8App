using System;
using System.Collections.Generic;

namespace Api.DTOs.Admin
{
    public class MemberViewDto
    {
        public string Id { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public bool IsLocked { get; set; }

        public DateTime DateCreated { get; set; }

        public IEnumerable<string> Roles { get; set; }
    }
}
