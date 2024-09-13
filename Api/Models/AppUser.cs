﻿using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class AppUser: IdentityUser
    {
        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string FirstName { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string LastName { get; set; }

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    }
}
//(ErrorMessage = "Please provide the first name")[StringLength(250, MinimumLength = 10)][Range(0, int.MaxValue)]