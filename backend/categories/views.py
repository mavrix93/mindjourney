from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        """Get categories filtered by type"""
        category_type = request.query_params.get("type")
        if category_type:
            categories = self.queryset.filter(category_type=category_type)
        else:
            categories = self.queryset

        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
