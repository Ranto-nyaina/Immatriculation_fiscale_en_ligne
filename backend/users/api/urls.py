from rest_framework import routers

from .views import login_view
from django.urls import path, include
from .views import MessagesAdminList
from .views import CivismeFiscaleViewSet
from .views import RegisterContribuable
from .views import update_user_info
from .views import get_user_info
from .views import logout_view
from .views import check_session
from .views import verify_user
from .views import update_password
from .views import ChatView
from .views import AdminChatView
from .views import HistogrammeAPIView
from .views import CentralRecetteViewSet
from .views import TransactionSearchView
from .views import verify_code, change_password
from .views import AdminSearchView


router = routers.DefaultRouter()

router.register(
    r'central_recette',
    CentralRecetteViewSet,
    basename='centralrecette'
)

router.register(
    r'civisme_fiscale',
    CivismeFiscaleViewSet,
    basename='civisme-fiscale'
)


urlpatterns = [

    path('change_password/', change_password, name='change_password'),

    path('verify-code/', verify_code, name='verify-code'),

    path('transactions/', TransactionSearchView.as_view(), name='transaction-search'),

    path('histogramme/', HistogrammeAPIView.as_view(), name='histogramme'),

    path('register/', RegisterContribuable.as_view(), name='register_contribuable'),

    path('chat/', ChatView.as_view(), name='chat'),

    path('Adminchat/', AdminChatView.as_view(), name='adminchat'),

    path('update-password/', update_password, name='update_password'),

    path('verify-user/', verify_user, name='verify_user'),

    path('check_session/', check_session, name='check_session'),

    path('update_user_info/', update_user_info, name='update_user_info'),

    path('get_user_info/', get_user_info, name='get_user_info'),

    path('AdminMessages/', MessagesAdminList.as_view(), name='messages_admin_list'),

    path('AdminSearch/', AdminSearchView.as_view(), name='admin-search'),

    path('login/', login_view, name='login'),

    path('logout/', logout_view, name='logout'),

    path('', include(router.urls)),
]