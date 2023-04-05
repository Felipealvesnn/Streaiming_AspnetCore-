using Microsoft.AspNetCore.SignalR;
using System.Threading.Channels;
using WEbCam_Streaiming_AspnetCore.Models;
using WEbCam_Streaiming_AspnetCore_Domain.HubsModels;

namespace WEbCam_Streaiming_AspnetCore.Hubs
{
    public class HubAutomatico : Hub<IConnectionHubAutomic>
    {
        private readonly List<UserAutomatic> _users;
        private readonly List<ConnectionAutomatic> _connections;
        private readonly List<CallAutomatic> _calls;

        public HubAutomatico(List<UserAutomatic> users, List<ConnectionAutomatic> connections, List<CallAutomatic> calls)
        {
            _users = users;
            _connections = connections;
            _calls = calls;
        }

        public async Task Join(string username)
        {
            _users.Add(new UserAutomatic
            {
                Username = username,
                ConnectionId = Context.ConnectionId
            });

            await UpdateOnlineUsers();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await HangUp();

            _users.RemoveAll(u => u.ConnectionId == Context.ConnectionId);

            await UpdateOnlineUsers();

            await base.OnDisconnectedAsync(exception);
        }

        public async Task Call(UserAutomatic targetConnectionId)
        {
            var callingUser = _users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = _users.SingleOrDefault(u => u.ConnectionId == targetConnectionId.ConnectionId);

            if (targetUser == null)
            {
                await Clients.Caller.LidacaoNegada(targetConnectionId, "Usuario nao existe.");
                return;
            }

            // Check connection
            if (GetConnection(targetUser.ConnectionId) != null)
            {
                await Clients.Caller.LidacaoNegada(targetConnectionId, string.Format("{0} Pessoa ja está em uma ligação.", targetUser.Username));
                return;
            }

            await Clients.Client(targetConnectionId.ConnectionId).ChamadaRecebida(callingUser);

            _calls.Add(new CallAutomatic
            {
                From = callingUser,
                To = targetUser,
                CallStartTime = DateTime.Now
            });
        }

        public async Task AnswerCall(bool acceptCall, UserAutomatic targetConnectionId)
        {
            var callingUser = _users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = _users.SingleOrDefault(u => u.ConnectionId == targetConnectionId.ConnectionId);




            if (targetUser == null)
            {
                await Clients.Caller.LigacaoDesligada(targetConnectionId, "Usuario Desligou");
                return;
            }

            if (!acceptCall)
            {

                await Clients.Client(targetConnectionId.ConnectionId).LidacaoNegada(callingUser, $"{callingUser.Username} Não pode aceitar a sua ligação.");
                return;
            }

            var callCount = _calls.RemoveAll(c => c.To.ConnectionId == callingUser.ConnectionId && c.From.ConnectionId == targetUser.ConnectionId);
            if (callCount < 1)
            {
                await Clients.Caller.LigacaoDesligada(targetConnectionId, $"{targetUser.Username} Ligacao desligada.");
                return;
            }

            // Check if user is in another call
            if (GetConnection(targetUser.ConnectionId) != null)
            {
                await Clients.Caller.LigacaoDesligada(targetConnectionId, $"{targetUser.Username} Em outra ligação.");
                return;
            }

            // Remove all the other offers for the call initiator, in case they have multiple calls out
            _calls.RemoveAll(c => c.From.ConnectionId == targetUser.ConnectionId);

            _connections.Add(new ConnectionAutomatic
            {
                Users = new List<UserAutomatic> { callingUser, targetUser }
            });
            await Clients.Caller.LigaCaoAceita(targetUser);
            await Clients.Client(targetConnectionId.ConnectionId).LigaCaoAceita(callingUser);

            await UpdateOnlineUsers();
        }

        public async Task HangUp()
        {
            var callingUser = _users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

            if (callingUser == null)
            {
                return;
            }

            var currentCall = GetConnection(callingUser.ConnectionId);

            // Send a hang up message to each user in the call, if there is one
            if (currentCall != null)
            {
                foreach (var user in currentCall.Users.Where(u => u.ConnectionId != callingUser.ConnectionId))
                {
                    await Clients.Caller.LigacaoDesligada(callingUser, $"{callingUser.Username} Desligando ai machoo");
                    await Clients.Client(user.ConnectionId).LigacaoDesligada(callingUser, $"{callingUser.Username} has hung up.");
                }

                currentCall.Users.RemoveAll(u => u.ConnectionId == callingUser.ConnectionId);
                if (currentCall.Users.Count < 2)
                {
                    _connections.Remove(currentCall);
                }
            }

            _calls.RemoveAll(c => c.From.ConnectionId == callingUser.ConnectionId);

            await UpdateOnlineUsers();
        }

        public async Task sendSignal(string data, string targetConnectionId)
        {
            var callingUser = _users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = _users.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            if (callingUser == null || targetUser == null)
            {
                return;
            }


            //Check the connection 
            var userCall = GetConnection(callingUser.ConnectionId);
            if (userCall != null && userCall.Users.Exists(u => u.ConnectionId == targetUser.ConnectionId))
            {
                await Clients.Client(targetUser.ConnectionId).ReceiveSignal(callingUser, data);
                // await Clients.Caller.ReceiveData(callingUser, data);
            }
        }

        public async Task SendDataMsg(string data, string targetConnectionId)
        {
            var callingUser = _users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = _users.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            if (callingUser == null || targetUser == null)
            {
                return;
            }


            //Check the connection 
            var userCall = GetConnection(callingUser.ConnectionId);
            if (userCall != null && userCall.Users.Exists(u => u.ConnectionId == targetUser.ConnectionId))
            {
                await Clients.Client(targetConnectionId).ReceiveDataMsg(callingUser, data);
            }
        }

      

    

       

        private async Task UpdateOnlineUsers()
        {
            _users.ForEach(u => u.InCall = (GetConnection(u.ConnectionId) != null));
            await Clients.All.AttUsuariosOnline(_users);
        }

        private ConnectionAutomatic GetConnection(string connectionId)
        {
            var matchingCall = _connections.FirstOrDefault(uc => uc.Users.FirstOrDefault(u => u.ConnectionId == connectionId) != null);
            return matchingCall;
        }
    }
}
