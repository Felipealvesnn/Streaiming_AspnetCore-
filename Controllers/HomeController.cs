using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using WEbCam_Streaiming_AspnetCore.Models;

namespace WEbCam_Streaiming_AspnetCore.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View("IndexWebRTC");
        }
        public IActionResult IndexWebRTC()
        {
            return View();
        }
        public IActionResult IndexAutomatica()
        {
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