import django_filters as filters
from django.db.models import Q

from .models import Rose

class RoseFilter(filters.FilterSet):
    group = filters.CharFilter(field_name='group__name', lookup_expr='icontains')
    search = filters.CharFilter(method='search_filter')
    
    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(title__iregex=value) | \
            Q(title_eng__iregex=value) | \
            Q(breeder__name__iregex=value)
        )
    
    class Meta:
        model = Rose
        fields = ['group', 'search']