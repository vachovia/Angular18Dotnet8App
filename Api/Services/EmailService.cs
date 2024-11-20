using Api.DTOs.Account;
using Api.Services.Interfaces;
using Api.Settings;
using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly IOptions<SmtpSettings> _smtpSettings;

        public EmailService(IConfiguration config, IOptions<SmtpSettings> smtpSettings)
        {
            _config = config;
            _smtpSettings = smtpSettings;
        }

        public async Task<bool> SendAsync(EmailSendDto emailSendDto)
        {
            try
            {
                var message = new MailMessage(_smtpSettings.Value.From, emailSendDto.To, emailSendDto.Subject, emailSendDto.Body);

                var emailClient = new SmtpClient(_smtpSettings.Value.Host, _smtpSettings.Value.Port);

                emailClient.Credentials = new NetworkCredential(_smtpSettings.Value.User, _smtpSettings.Value.Password);

                await emailClient.SendMailAsync(message);

                return true;

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());

                return false;
            }
        }

        public async Task<bool> SendEmailAsync(EmailSendDto emailSendDto)
        {
            try
            {
                var apiKey = _config["MailJet:ApiKey"];
                var secretKey = _config["MailJet:SecretKey"];
                var emailFrom = _config["Email:From"];
                var appName = _config["Email:ApplicationName"];

                MailjetClient client = new MailjetClient(apiKey, secretKey);

                var email = new TransactionalEmailBuilder()
                    .WithFrom(new SendContact(emailFrom, appName))
                    .WithSubject(emailSendDto.Subject)
                    .WithHtmlPart(emailSendDto.Body)
                    .WithTo(new SendContact(emailSendDto.To))
                    .Build();

                var response = await client.SendTransactionalEmailAsync(email);

                if (response.Messages != null)
                {
                    if (response.Messages[0].Status == "success")
                    {
                        return true;
                    }
                }

                return false;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());

                return false;
            }            
        }

        public async Task<bool> SendEmailAsyncAlt(EmailSendDto emailSendDto)
        {
            try
            {
                var userName = _config["SMTP:Username"];
                var password = _config["SMTP:Password"];
                var host = "smtp-mail.outlook.com";
                var port = 587;

                var client = new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(userName, password)
                };

                var message = new MailMessage(from: userName, to: emailSendDto.To, subject: emailSendDto.Subject, body: emailSendDto.Body);

                message.IsBodyHtml = true;

                await client.SendMailAsync(message);

                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());

                return false;
            }            
        }
    }
}
