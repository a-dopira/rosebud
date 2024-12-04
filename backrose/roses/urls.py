from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, RoseViewSet, BreederViewSet, PestViewSet, PesticideViewSet, FungusViewSet, FungicideViewSet, SizeViewSet, FeedingViewSet, RosePhotoViewSet, VideoViewSet, FoliageViewSet

router = DefaultRouter()
router.register(r'roses', RoseViewSet, basename="rose")
router.register(r'groups', GroupViewSet, basename="group")
router.register(r'breeders', BreederViewSet)
router.register(r'pests', PestViewSet)
router.register(r'pesticides', PesticideViewSet)
router.register(r'fungi', FungusViewSet)
router.register(r'fungicides', FungicideViewSet)
router.register(r'sizes', SizeViewSet)
router.register(r'feedings', FeedingViewSet)
router.register(r'rosephotos', RosePhotoViewSet)
router.register(r'videos', VideoViewSet)
router.register(r'foliages', FoliageViewSet)

urlpatterns = router.urls