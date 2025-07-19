from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    GroupViewSet,
    RoseViewSet,
    BreederViewSet,
    PestViewSet,
    PesticideViewSet,
    RosePesticideViewSet,
    FungusViewSet,
    FungicideViewSet,
    RoseFungicideViewSet,
    SizeViewSet,
    FeedingViewSet,
    RosePhotoViewSet,
    VideoViewSet,
    FoliageViewSet,
    AdjustmentsViewSet,
)

router = DefaultRouter()
router.register(r"roses", RoseViewSet, basename="rose")
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"breeders", BreederViewSet, basename="breeder")
router.register(r"pests", PestViewSet, basename="pest")
router.register(r"fungi", FungusViewSet, basename="fungus")
router.register(r"pesticides", PesticideViewSet, basename="pesticide")
router.register(r"fungicides", FungicideViewSet, basename="fungicide")
router.register(r"adjustments", AdjustmentsViewSet, basename="adjustments")

roses_router = routers.NestedDefaultRouter(router, r"roses", lookup="rose")
roses_router.register(r"sizes", SizeViewSet, basename="rose-sizes")
roses_router.register(r"feedings", FeedingViewSet, basename="rose-feedings")
roses_router.register(r"foliages", FoliageViewSet, basename="rose-foliages")
roses_router.register(r"photos", RosePhotoViewSet, basename="rose-photos")
roses_router.register(r"videos", VideoViewSet, basename="rose-videos")
roses_router.register(r"pesticides", RosePesticideViewSet, basename="rose-pesticides")
roses_router.register(r"fungicides", RoseFungicideViewSet, basename="rose-fungicides")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(roses_router.urls)),
]
