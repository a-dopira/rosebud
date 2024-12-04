from collections import OrderedDict

# class FilterMixin:
#     filter_fields = []

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         for field in self.filter_fields:
#             filter_value = self.request.query_params.get(field, None)
#             if filter_value is not None:
#                 filter_dict = {f'{field}__iregex': filter_value}
#                 queryset = queryset.filter(**filter_dict)
#         return queryset
    

class OrderedRepresentationMixin:
    new_order = []

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return OrderedDict([(key, representation[key]) for key in self.new_order])