# views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from .serializers import LoginSerializer
from django.contrib.auth.models import User

@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        try:
            # Rechercher l'utilisateur par email
            user = User.objects.get(email=email)
            if user is not None:
                user = authenticate(username=user.username, password=password)  # Authentifier avec le nom d'utilisateur
                if user is not None:
                    return Response({'message': 'Login successful', 'user_id': user.id}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
