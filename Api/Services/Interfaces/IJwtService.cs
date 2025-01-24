using Api.Models;
using System.Threading.Tasks;

namespace Api.Services.Interfaces
{
    public interface IJwtService
    {
        Task<string> CreateJwt(AppUser user);
        RefreshToken CreateRefreshToken(AppUser user);
    }
}