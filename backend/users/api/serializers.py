from rest_framework import serializers

from ..models import (
    CentralRecette,
    CivismeFiscale,
    Contribuable,
    Genre,
    Message,
    MessagesAdmin,
    TransactionView,
    VueSommeParContribuableParAnnee,
)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionView
        fields = ['id', 'contribuable', 'n_quit', 'date_paiement', 'montant']


class MessageSerializer(serializers.ModelSerializer):
    """Lecture des messages et réponse de l'administrateur."""

    class Meta:
        model = Message
        fields = '__all__'


class MessageCreateSerializer(serializers.ModelSerializer):
    """Un contribuable ne peut envoyer que le texte de sa question
    (il ne peut pas fabriquer une « réponse » ni choisir un PRENIF)."""

    class Meta:
        model = Message
        fields = ('question',)


class MessagesAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessagesAdmin
        fields = '__all__'


class UserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'genre')


class CivismeFiscaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CivismeFiscale
        fields = '__all__'


class ContribuableSerializer(serializers.ModelSerializer):
    """Lecture seule (administrateurs) : le mot de passe n'est JAMAIS renvoyé."""

    class Meta:
        model = Contribuable
        exclude = ('password',)


class RegisterSerializer(serializers.ModelSerializer):
    """Inscription : seuls ces champs sont acceptés depuis le client.
    Le PRENIF et les valeurs par défaut sont fixés par le serveur."""

    propr_cin = serializers.CharField(max_length=15)
    propr_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    propr_contact = serializers.CharField(max_length=14)
    mailing_address = serializers.EmailField(max_length=200)

    class Meta:
        model = Contribuable
        fields = (
            'propr_cin', 'propr_name', 'last_name',
            'propr_contact', 'mailing_address', 'password',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def validate_mailing_address(self, value):
        # L'e-mail sert d'identifiant de connexion : il doit être unique
        if Contribuable.objects.filter(mailing_address__iexact=value).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà utilisée.")
        return value


class CentralRecetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentralRecette
        fields = '__all__'


class VueSommeParContribuableParAnneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VueSommeParContribuableParAnnee
        fields = ['id', 'contribuable', 'annee', 'total_mnt_ver']