namespace WEbCam_Streaiming_AspnetCore_Domain.HubsModels
{
    public class User
    {
        public string? Username { get; set; }
        public string? ConnectionId { get; set; }
        public bool InCall { get; set; }
    }

    public class Connection
    {
        public List<User>? Users { get; set; }
    }
    public class Call 
    {
        public User? From { get; set; }
        public User? To { get; set; }
        public DateTime CallStartTime { get; set; }
    }
}
