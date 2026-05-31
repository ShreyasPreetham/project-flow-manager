from django.http import JsonResponse


def api_index(request):
    base = f"{request.scheme}://{request.get_host()}"
    return JsonResponse(
        {
            "message": "Project Flow Manager API is running",
            "frontend_url": "https://project-flow-manager.vercel.app",
            "endpoints": {
                "register": f"{base}/api/register/",
                "login": f"{base}/api/login/",
                "token_refresh": f"{base}/api/token/refresh/",
                "me": f"{base}/api/me/",
                "projects": f"{base}/api/projects/",
            },
        }
    )
