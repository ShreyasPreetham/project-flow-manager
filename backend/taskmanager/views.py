from django.http import HttpResponse, JsonResponse


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


def root_landing(request):
    base = f"{request.scheme}://{request.get_host()}"
    html = f"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Project Flow Manager API</title>
  <style>
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f4f7fb;
      color: #0f172a;
    }}
    .wrap {{
      max-width: 900px;
      margin: 40px auto;
      padding: 0 16px;
    }}
    .card {{
      background: #fff;
      border: 1px solid #dbe3ef;
      border-radius: 14px;
      padding: 22px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    }}
    h1 {{
      margin: 0 0 8px;
      font-size: 28px;
    }}
    p {{
      margin: 0 0 18px;
      color: #475569;
    }}
    ol {{
      margin: 0;
      padding-left: 22px;
    }}
    li {{
      margin: 10px 0;
    }}
    a {{
      color: #2563eb;
      text-decoration: none;
      word-break: break-all;
    }}
    a:hover {{
      text-decoration: underline;
    }}
    .meta {{
      margin-top: 18px;
      font-size: 14px;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Project Flow Manager Backend</h1>
      <p>Backend is live. Use the links below one after another.</p>
      <ol>
        <li><a href="{base}/api/register/" target="_blank">{base}/api/register/</a> - register a user</li>
        <li><a href="{base}/api/login/" target="_blank">{base}/api/login/</a> - login and get JWT tokens</li>
        <li><a href="{base}/api/token/refresh/" target="_blank">{base}/api/token/refresh/</a> - refresh access token</li>
        <li><a href="{base}/api/me/" target="_blank">{base}/api/me/</a> - current user (requires token)</li>
        <li><a href="{base}/api/projects/" target="_blank">{base}/api/projects/</a> - projects and nested tasks</li>
        <li><a href="{base}/api/" target="_blank">{base}/api/</a> - raw API index JSON</li>
      </ol>
      <div class="meta">Frontend: <a href="https://project-flow-manager.vercel.app" target="_blank">https://project-flow-manager.vercel.app</a></div>
    </div>
  </div>
</body>
</html>
"""
    return HttpResponse(html)
