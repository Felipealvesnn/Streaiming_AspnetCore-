using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using WEbCam_Streaiming_AspnetCore.Hubs;
using WEbCam_Streaiming_AspnetCore.Models;

namespace WEbCam_Streaiming_AspnetCore.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
      
        private readonly IHubContext<MyHub, IConnectionHub> _hubContext;

        public HomeController(ILogger<HomeController> logger, IHubContext<MyHub, IConnectionHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        public IActionResult Index()
        {
            
            return View("IndexWebRTC");
        }

        //public async Task<IActionResult> Hub(string TargetId,IFormFile arquivo)
        //{
        //   await _hubContext.Clients.Client(TargetId).ReceberArquivo("teste");
        //    return Json(new {sucesso = "suycesso" });
        //}

        public IActionResult IndexAutomatica(string ConectId)
        {
            ViewBag.ConectId = ConectId != null ? ConectId : null; 
            
            
            return View();
        }
        
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}