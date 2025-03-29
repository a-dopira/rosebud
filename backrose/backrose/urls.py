from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("userprofile.urls")),
    path("api/", include("roses.urls")),
    
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^(?P<path>.*\.svg)$', serve, {'document_root': settings.BASE_DIR / "frontend" / "build"}),
    
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]