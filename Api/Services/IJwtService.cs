using Api.Models;

namespace Api.Services
{
    public interface IJwtService
    {
        string CreateJwt(AppUser user);
    }
}