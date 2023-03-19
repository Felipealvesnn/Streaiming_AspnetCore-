using System.Threading.Channels;
using WEbCam_Streaiming_AspnetCore.Models;

namespace WEbCam_Streaiming_AspnetCore.Hubs
{
    public interface IConnectionHub
    {
        Task AttUsuariosOnline(List<User> userList);
        Task LigaCaoAceita(User acceptingUser);
        Task LidacaoNegada(User decliningUser, string reason);
        Task ChamadaRecebida(User callingUser);
        Task ReceiveData(User signalingUser, string signal);
        Task UploadStream(ChannelReader<string> stream);
        Task LigacaoDesligada(User signalingUser, string signal);
        Task ReceiveDataMsg(User callingUser, string data);
      
        Task receberArquivo(byte[] pdfBytes);
    }
}
