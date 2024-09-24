using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Api.Models;
using Microsoft.AspNetCore.Identity;
using System;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddIdentityCore<AppUser>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.User.RequireUniqueEmail = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);

    options.SignIn.RequireConfirmedEmail = true;
})
.AddRoles<IdentityRole>()
.AddRoleManager<RoleManager<IdentityRole>>()
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager<SignInManager<AppUser>>()
.AddUserManager<UserManager<AppUser>>()
.AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"];
var validIssuer = builder.Configuration["Jwt:Issuer"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidIssuer = validIssuer,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    }
);

builder.Services.AddCors();

// To flatten ModelState errors into one object
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        var errors = actionContext.ModelState
        .Where(x => x.Value.Errors.Count > 0)
        .SelectMany(x => x.Value.Errors)
        .Select(x => x.ErrorMessage).ToArray();

        var toReturn = new
        {
            Errors = errors
        };

        return new BadRequestObjectResult(toReturn);
    };
});

var app = builder.Build();

var clientUrl = builder.Configuration["Jwt:ClientUrl"];

app.UseCors(options =>
{
    options.AllowAnyMethod().AllowAnyHeader().WithOrigins(clientUrl).WithExposedHeaders("*");
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
