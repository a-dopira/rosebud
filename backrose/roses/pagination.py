from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

import math


class RosePagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "page_size"
    max_page_size = 18

    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size)
        return Response(
            {
                "current_page": self.page.number,
                "total_pages": total_pages,
                "total_items": self.page.paginator.count,
                "roses": data,
            }
        )
