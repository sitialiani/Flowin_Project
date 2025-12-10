from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse 

def home_view(request):
    html_content = """
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flowin Backend</title>
        <style>
            body {
                background-color: #f8fafc;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                color: #334155;
            }
            .card {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                animation: float 3s ease-in-out infinite;
            }
            h1 { font-size: 60px; margin: 0; }
            h2 { color: #FF366F; margin-top: 10px; margin-bottom: 5px; }
            p { color: #64748b; font-size: 14px; }
            .badge {
                background: #dcfce7;
                color: #166534;
                padding: 5px 12px;
                border-radius: 50px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-top: 15px;
            }
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🚀</h1>
            <h2>Backend Flowin</h2>
            <p>Server Django berhasil berjalan normal.</p>
            <div class="badge">STATUS: ONLINE</div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

urlpatterns = [
    path('', home_view, name='home'), 
    path('admin/', admin.site.urls),
    path('api/', include('clustering.urls')), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)