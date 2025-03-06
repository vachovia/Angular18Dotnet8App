using Api;
using System;
using Api.Data;
using Api.Models;
using System.Linq;
using System.Text;
using Api.Settings;
using Api.Services;
using System.Security.Claims;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IContextSeedService, ContextSeedService>();

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SMTPBrevo"));

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        options.IncludeErrorDetails = true;
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

builder.Services.AddAuthorization(opt => {
    opt.AddPolicy(SD.AdminPolicy, policy => policy.RequireRole(SD.AdminRole));
    opt.AddPolicy(SD.ManagerPolicy, policy => policy.RequireRole(SD.ManagerRole));
    opt.AddPolicy(SD.PlayerPolicy, policy => policy.RequireRole(SD.PlayerRole));

    opt.AddPolicy(SD.AdminOrManagerPolicy, policy => policy.RequireRole(SD.AdminRole, SD.ManagerRole));
    opt.AddPolicy(SD.AdminAndManagerPolicy, policy => policy.RequireRole(SD.AdminRole).RequireRole(SD.ManagerRole));
    opt.AddPolicy(SD.AllRolePolicy, policy => policy.RequireRole(SD.AdminRole, SD.ManagerRole, SD.PlayerRole));

    opt.AddPolicy(SD.AdminEmailPolicy, policy => policy.RequireClaim(ClaimTypes.Email, SD.AdminEmail));
    opt.AddPolicy(SD.MillerSurnamePolicy, policy => policy.RequireClaim(ClaimTypes.Surname, SD.MillerSurname));
    opt.AddPolicy(SD.ManagerEmailAndWilsonSurnamePolicy, policy => policy.RequireClaim(ClaimTypes.Email, SD.ManagerEmail).RequireClaim(ClaimTypes.Surname, SD.WilsonSurname));

    opt.AddPolicy(SD.VipPolicy, policy => policy.RequireAssertion(context => SD.VipPolicyCheck(context)));
});

// Added package Microsoft.AspNetCore.Http.Extension
builder.Services.AddHttpClient("FacebookAPI", client =>
{
    client.BaseAddress = new Uri("https://graph.facebook.com");
});

var app = builder.Build();

var clientUrl = builder.Configuration["Jwt:ClientUrl"];

app.UseCors(options =>
{
    options.AllowAnyMethod().AllowAnyHeader().AllowCredentials().WithOrigins(clientUrl).WithExposedHeaders("*");
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// is going to look for index.html and serving our api application using index.html
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
// app.MapFallbackToController("Index", "Fallback");

#region Context Seed
using var scope = app.Services.CreateScope();
try
{
    // NuGet Package Manager Console -> Drop-Database
    var contextSeedService = scope.ServiceProvider.GetService<IContextSeedService>();
    await contextSeedService.InitializeContextAsync();
}
catch(Exception ex)
{
    var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
    logger.LogError(ex.Message, "Failed to initialize and seed the database.");
}
#endregion

app.Run();


// Add-Migration AddingUserToDatabase -o Data/Migrations // To undo this action, use Remove-Migration. (Before Update-Database action)
// Update-Database
// Drop-Database