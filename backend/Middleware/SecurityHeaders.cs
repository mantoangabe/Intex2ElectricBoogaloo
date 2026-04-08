using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace backend.Middleware;

public static class SecurityHeaders
{
    public const string ContentSecurityPolicy = "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'";

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            var isSwaggerInDevelopment =
                context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment() &&
                context.Request.Path.StartsWithSegments("/swagger");

            if (!isSwaggerInDevelopment)
            {
                context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
            }

            await next();
        });
    }
}
