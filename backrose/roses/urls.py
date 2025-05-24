from django.urls import path
from rest_framework.routers import DefaultRouter
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
    AdjustmentViewSet,
)

router = DefaultRouter()
router.register(r"roses", RoseViewSet, basename="rose")
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"breeders", BreederViewSet, basename="breeder")
router.register(r"pests", PestViewSet, basename="pest")
router.register(r"fungi", FungusViewSet, basename="fungus")
router.register(r"pesticides", PesticideViewSet)
router.register(r"fungicides", FungicideViewSet)
router.register(r"rosepesticides", RosePesticideViewSet)
router.register(r"rosefungicides", RoseFungicideViewSet)
router.register(r"sizes", SizeViewSet, basename="size")
router.register(r"feedings", FeedingViewSet, basename="feeding")
router.register(r"rosephotos", RosePhotoViewSet, basename="rosephoto")
router.register(r"videos", VideoViewSet, basename="video")
router.register(r"foliages", FoliageViewSet, basename="foliage")
router.register(r"adjustment", AdjustmentViewSet, basename="adjustment")

urlpatterns = router.urls
