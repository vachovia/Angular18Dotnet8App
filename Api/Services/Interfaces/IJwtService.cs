using Api.Models;

namespace Api.Services.Interfaces
{
    public interface IJwtService
    {
        string CreateJwt(AppUser user);
    }
}