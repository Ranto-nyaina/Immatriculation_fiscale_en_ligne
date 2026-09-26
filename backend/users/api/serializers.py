import re
from datetime import date

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
    """Inscription : ces champs sont acceptés depuis le client.
    Le PRENIF et les valeurs par défaut restantes sont fixés par le serveur.

    Champs obligatoires : identité + contact + mot de passe (nécessaires pour
    retrouver l'opérateur et se connecter). Le reste est optionnel : l'écran
    d'inscription peut les demander en plusieurs étapes, ou pas du tout."""

    propr_cin = serializers.CharField(max_length=20)
    propr_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    propr_contact = serializers.CharField(max_length=20)   # tolère espaces et +261
    mailing_address = serializers.EmailField(max_length=200)

    # Optionnels : correspondent aux colonnes réelles de la table contribuable
    sexe = serializers.ChoiceField(choices=Contribuable.genre_choices, required=False, allow_null=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    birth_place = serializers.CharField(max_length=120, required=False, allow_blank=True, allow_null=True)
    sit_matrim = serializers.ChoiceField(choices=Contribuable.sit_matrim_choices, required=False, allow_null=True)
    delivr_cin_date = serializers.DateField(required=False, allow_null=True)
    cin_place = serializers.CharField(max_length=120, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Contribuable
        fields = (
            'propr_cin', 'propr_name', 'last_name',
            'propr_contact', 'mailing_address', 'password',
            'sex', 'birth_date', 'birth_place',
            'sit_matrim', 'delivr_cin_date', 'cin_place',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def validate_propr_cin(self, value):
        # Le CIN s'écrit souvent avec des espaces (« 101 012 345 678 ») : on les retire
        cleaned = re.sub(r"[\s.\-]", "", value)
        if not (cleaned.isdigit() and len(cleaned) == 12):
            raise serializers.ValidationError("Le CIN doit contenir exactement 12 chiffres.")
        return cleaned

    def validate_birth_date(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("La date de naissance ne peut pas être dans le futur.")
        return value

    def validate_delivr_cin_date(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("La date de délivrance ne peut pas être dans le futur.")
        return value

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