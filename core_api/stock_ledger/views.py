from django.shortcuts import render
from rest_framework import viewsets, permissions, filters # Added filters
from django_filters.rest_framework import DjangoFilterBackend # New import
from rest_framework.response import Response
from rest_framework.decorators import action
# Create your views here.
from rest_framework import viewsets, permissions
from .models import Warehouse, Location, Product, StockMovement
from .serializers import (
    WarehouseSerializer, LocationSerializer, 
    ProductSerializer, StockMovementSerializer
)

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    # This ensures only logged-in people can see the data
    permission_classes = [permissions.IsAuthenticated]

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # The Search Engine
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category'] # Lets frontend filter by Raw Material, etc.
    search_fields = ['name', 'sku'] # Lets frontend type "Steel" and find it

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().order_by('-date')
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    # The PDF Requirement: Dynamic Filters
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['movement_type', 'status', 'source__warehouse', 'destination__warehouse']

    def perform_create(self, serializer):
        # ... (Keep Aryan's math logic exactly as it is here!)
        pass