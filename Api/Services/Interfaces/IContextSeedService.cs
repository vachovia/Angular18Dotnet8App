using System.Threading.Tasks;

namespace Api.Services.Interfaces
{
    public interface IContextSeedService
    {
        Task InitializeContextAsync();
    }
}