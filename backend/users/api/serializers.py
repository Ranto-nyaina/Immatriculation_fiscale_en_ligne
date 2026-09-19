from rest_framework import serializers
from ..models import Genre
from ..models import CivismeFiscale
from ..models import Contribuable
from ..models import Message
from ..models import CentralRecette
from ..models import VueSommeParContribuableParAnnee
from ..models import TransactionView
from ..models import MessagesAdmin

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionView
        fields = ['id', 'contribuable', 'n_quit', 'date_paiement', 'montant']
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class MessagesAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessagesAdmin
        fields = '__all__'

class   UserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'genre')

class CivismeFiscaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CivismeFiscale
        fields = '__all__'

class ContribuableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribuable
        fields = '__all__'

class CentralRecetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentralRecette
        fields = '__all__'


class VueSommeParContribuableParAnneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VueSommeParContribuableParAnnee
        fields = ['id','contribuable', 'annee', 'total_mnt_ver']