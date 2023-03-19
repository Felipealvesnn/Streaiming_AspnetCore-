using WEbCam_Streaiming_AspnetCore;
using WEbCam_Streaiming_AspnetCore.Hubs;
using WEbCam_Streaiming_AspnetCore.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 50485760; // 10MB em bytes
});

builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = 502400000; // tamanho máximo em bytes
});

builder.Services.AddSingleton<List<User>>();
builder.Services.AddSingleton<List<Connection>>();
builder.Services.AddSingleton<List<Call>>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseCors("CorsPolicy");

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

//app.UseStreamSocket();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<Hub>("/cnnctn");

    //endpoints.MapHub<Hub>("/cnnctn", options =>
    //{
    //    options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
    //});
    
});

app.Run();
