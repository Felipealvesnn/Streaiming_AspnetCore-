using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WEbCam_Streaiming_AspnetCore_Domain.HubsModels;

namespace WEbCam_Streaiming_AspnetCore_Infra_IOC
{
    public static class DependencyInjection
    {
        public static IServiceCollection ConfiguraçaoInjecao(this IServiceCollection Services, IConfiguration configuration)
        {
            Services.AddSingleton<List<User>>();
            Services.AddSingleton<List<Connection>>();
            Services.AddSingleton<List<Call>>();

            Services.AddSingleton<List<UserAutomatic>>();
            Services.AddSingleton<List<ConnectionAutomatic>>();
            Services.AddSingleton<List<CallAutomatic>>();

            return Services;
        }
    }
}
