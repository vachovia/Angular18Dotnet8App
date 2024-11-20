using Api.DTOs.Account;
using System.Threading.Tasks;

namespace Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendAsync(EmailSendDto emailSendDto);
        Task<bool> SendEmailAsync(EmailSendDto emailSend);
        Task<bool> SendEmailAsyncAlt(EmailSendDto emailSend);
    }
}