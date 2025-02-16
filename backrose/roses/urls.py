from rest_framework.routers import DefaultRouter
from .views import (
    GroupViewSet,
    RoseViewSet,
    BreederViewSet,
    PestViewSet,
    PesticideViewSet,
    FungusViewSet,
    FungicideViewSet,
    SizeViewSet,
    FeedingViewSet,
    RosePhotoViewSet,
    VideoViewSet,
    FoliageViewSet,
)

router = DefaultRouter()
router.register(r"roses", RoseViewSet, basename="rose")
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"breeders", BreederViewSet, basename="breeder")
router.register(r"pests", PestViewSet, basename="pest")
router.register(r"pesticides", PesticideViewSet, basename="pesticide")
router.register(r"fungi", FungusViewSet, basename="fungus")
router.register(r"fungicides", FungicideViewSet, basename="fungicide")
router.register(r"sizes", SizeViewSet, basename="size")
router.register(r"feedings", FeedingViewSet, basename="feeding")
router.register(r"rosephotos", RosePhotoViewSet, basename="rosephoto")
router.register(r"videos", VideoViewSet, basename="video")
router.register(r"foliages", FoliageViewSet, basename="foliage")

urlpatterns = router.urls
