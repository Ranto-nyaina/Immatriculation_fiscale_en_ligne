from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.auth.hashers import make_password


class Message(models.Model):
    prenif = models.TextField()
    question = models.TextField(null=True, blank=True)
    reponse = models.TextField(null=True, blank=True)
    date_question = models.DateTimeField(auto_now_add=True)
    date_reponse = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"

class Genre(models.Model):
    genre = models.CharField(max_length=50)

    class Meta:
        db_table = "genre"

class SituationMatrimoniale(models.Model):
    situation = models.CharField(max_length=50)

    def __str__(self):
        return self.situation

class Country(models.Model):
    country_name = models.CharField(max_length=100)
    country_name_f = models.CharField(max_length=20)
    country_name_s = models.CharField(max_length=20)
    country_code = models.CharField(max_length=4)
    capital = models.CharField(max_length=100)

    def __str__(self):
        return self.country_name

class Parish(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    parish_name = models.CharField(max_length=35)
    parish_name_f = models.CharField(max_length=35)
    parish_name_s = models.CharField(max_length=35)
    parish_code = models.CharField(max_length=4)

    def __str__(self):
        return self.parish_name

class City(models.Model):
    parish = models.ForeignKey(Parish, on_delete=models.CASCADE)
    city_name = models.CharField(max_length=25)
    city_name_f = models.CharField(max_length=25)
    city_name_s = models.CharField(max_length=25)
    city_code = models.CharField(max_length=5)
    city_name_extra = models.CharField(max_length=50)

    def __str__(self):
        return self.city_name

class Locality(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    locality_desc = models.CharField(max_length=30)
    locality_desc_f = models.CharField(max_length=30)
    locality_desc_s = models.CharField(max_length=30)
    locality_code = models.CharField(max_length=6)

    def __str__(self):
        return self.locality_desc

class Wereda(models.Model):
    locality = models.ForeignKey(Locality, on_delete=models.CASCADE)
    wereda_desc = models.CharField(max_length=50)
    wereda_code = models.IntegerField()

    def __str__(self):
        return self.wereda_desc


class Fokontany(models.Model):
    wereda = models.ForeignKey(Wereda, on_delete=models.CASCADE)
    fkt_desc = models.CharField(max_length=500)

    def __str__(self):
        return self.fkt_desc

class Contribuable(models.Model):
    genre_choices = [(1, 'Homme'), (2, 'Femme')]
    sit_matrim_choices = [(1, 'Célibataire'), (2, 'Marié(e)'), (3, 'Divorcé(e)'), (4, 'Veuf(ve)')]

    id_contribuable = models.AutoField(primary_key=True)
    create_date = models.DateField(auto_now_add=True)
    dm_cin = models.CharField(max_length=15, null=True, blank=True)
    propr_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    sexe = models.IntegerField(choices=genre_choices, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    birth_place = models.CharField(max_length=120, null=True, blank=True)
    sit_matrim = models.IntegerField(choices=sit_matrim_choices, null=True, blank=True)
    propr_cin = models.CharField(max_length=15, null=True, blank=True)
    delivr_cin_date = models.DateField(null=True, blank=True)
    cin_place = models.CharField(max_length=120, null=True, blank=True)
    propr_contact = models.CharField(max_length=14, null=True, blank=True)
    mailing_address = models.CharField(max_length=200, null=True, blank=True)
    bank_acct_no = models.CharField(max_length=250, null=True, blank=True)
    passeport = models.CharField(max_length=20, null=True, blank=True)
    dm_ref = models.CharField(max_length=15, null=True, blank=True)
    propr_prenif = models.CharField(max_length=10, null=True, blank=True)
    statistic_no = models.CharField(max_length=21, null=True, blank=True)
    statistic_date = models.DateField(null=True, blank=True)
    fkt_no = models.DateField(null=True, blank=True)
    password = models.CharField(
        max_length=128,
        validators=[
            MinLengthValidator(8),
            RegexValidator(
                r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
                'Le mot de passe doit contenir au moins une lettre, un chiffre, et un caractère spécial parmi @$!%*?&.'
            )
        ]
    )

    photo = models.CharField(max_length=200, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.password:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Contribuable {self.id_contribuable}"

    class Meta:
        db_table = "contribuable"


class Operateur(models.Model):
    propr_cin = models.CharField(max_length=220)
    propr_contact = models.CharField(max_length=220)
    propr_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "operateur"

class CivismeFiscale(models.Model):
    video = models.BinaryField()  # Champ pour stocker les données binaires de la vidéo
    description = models.TextField()  # Description détaillée
    question = models.TextField()  # Question associée
    reponse = models.TextField()  # Réponse associée
    quizz = models.JSONField()  # Quizz sous forme de données JSON

    class Meta:
        db_table = "civisme_fiscale"

class Logiciel(models.Model):
    logiciel = models.CharField(max_length=50)  # SURF/SIGTAS/HETRAONLINE

    class Meta:
        db_table = "logiciel"


class ModePaiement(models.Model):
    sens = models.CharField(max_length=100)  # depot, declaration, espece, virement

    class Meta:
        db_table = "mode_paiement"


class NumImpot(models.Model):
    impot = models.CharField(max_length=200)  # IRSA=5, IR=10, IS=15, AMENDE=43, PENALITE=44
    numero = models.IntegerField()

    class Meta:
        db_table = "num_impot"

class CentralRecette(models.Model):
    id_transaction = models.AutoField(primary_key=True)
    id_contribuable = models.ForeignKey(Contribuable, on_delete=models.CASCADE)
    id_centre_recette = models.CharField(max_length=200)  # NIF+QUIT+CENTRE
    regisseur = models.CharField(max_length=50, null=True, blank=True)
    logiciel = models.ForeignKey(Logiciel, on_delete=models.CASCADE)
    ref_trans = models.CharField(max_length=60)
    ref_reglement = models.CharField(max_length=60)
    daty = models.DateField()  # date
    mouvement = models.CharField(max_length=1, default='0')  # 1/0
    moyen_paiement = models.CharField(max_length=2, null=True, blank=True)
    rib = models.CharField(max_length=30, null=True, blank=True)
    prenif = models.CharField(max_length=20, null=True, blank=True)
    raison_sociale = models.CharField(max_length=250, null=True, blank=True)
    nimp = models.ForeignKey(NumImpot, on_delete=models.CASCADE)  # N° impôts
    numrec = models.IntegerField()  # N° de créance
    libelle = models.CharField(max_length=20)
    flag = models.CharField(max_length=1, default='N')
    date_debut = models.DateField()  # date début de paiement
    date_fin = models.DateField()  # date fin de paiement
    periode = models.IntegerField(default=1)  # période impôts (1 ou 2)
    periode2 = models.CharField(max_length=10, null=True, blank=True)
    mnt_ap = models.FloatField()  # montant à payer
    base = models.FloatField()  # base de calcul
    imp_detail = models.CharField(max_length=200, null=True, blank=True)  # Nature impôts
    da = models.IntegerField(default=0)  # Début d'activité 1/0
    banque = models.CharField(max_length=75, null=True, blank=True)
    annee_recouvrement = models.IntegerField()
    code_bureau = models.CharField(max_length=250)
    libelle_bureau = models.CharField(max_length=250)

    class Meta:
        db_table = "central_recette"


class Paiement(models.Model):
    id_contribuable = models.ForeignKey('Contribuable', on_delete=models.CASCADE)
    central_recette = models.ForeignKey(CentralRecette, on_delete=models.CASCADE)
    mode_paiement = models.ForeignKey(ModePaiement, on_delete=models.CASCADE)
    n_quit = models.CharField(max_length=50)  # Numéro quittance de paiement
    montant = models.FloatField()  # montant à payer
    date_paiement = models.DateField(auto_now_add=True)  # date de paiement

    class Meta:
        db_table = "paiement"

class VueSommeParContribuableParAnnee(models.Model):
    contribuable = models.IntegerField()  # ou le type correspondant
    annee = models.IntegerField()
    total_mnt_ver = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False  # Ne pas créer, modifier ou supprimer la vue via migrations
        db_table = 'vue_somme_par_contribuable_par_annee'  # Nom exact de la vue dans la base de données

class TransactionView(models.Model):
    id = models.IntegerField(primary_key=True)
    contribuable = models.IntegerField()
    n_quit = models.CharField(max_length=50)
    date_paiement = models.DateField()
    annee_de_paiement = models.IntegerField()
    annee_recouvrement = models.IntegerField()
    date_debut = models.DateField()
    date_fin = models.DateField()
    base = models.DecimalField(max_digits=10, decimal_places=2)
    mnt_ap = models.DecimalField(max_digits=10, decimal_places=2)
    nimp = models.IntegerField()
    imp_detail = models.TextField()
    numero = models.CharField(max_length=50)
    impot = models.CharField(max_length=50)
    sens = models.CharField(max_length=50)
    logiciel = models.CharField(max_length=50)
    montant = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False  # Ne pas créer de table, utiliser uniquement la vue
        db_table = 'vue_detail_transactions_par_quit_et_contribuable'

class MessagesAdmin(models.Model):
    contribuable = models.IntegerField()
    photo = models.CharField(max_length=200, null=True, blank=True)
    propr_prenif = models.CharField(max_length=50)
    propr_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    questions = models.TextField()
    reponses = models.TextField()
    date_reponse = models.DateField()
    date_question = models.DateField()
    class Meta:
        managed = False  # Ne pas créer de table, utiliser uniquement la vue
        db_table = 'vue_messages'

class AuthToken(models.Model):
    """Token de session d'un contribuable, avec date d'expiration."""

    key = models.CharField(max_length=64, primary_key=True)
    contribuable = models.ForeignKey(
        "Contribuable", on_delete=models.CASCADE, related_name="tokens"
    )
    created = models.DateTimeField(auto_now_add=True)
    expires = models.DateTimeField()

    class Meta:
        db_table = "auth_token_contribuable"


class VerificationCode(models.Model):
    """Code à 6 chiffres envoyé par e-mail (connexion ou mot de passe oublié)."""

    PURPOSES = [("login", "Connexion"), ("reset", "Mot de passe oublié")]

    contribuable = models.ForeignKey(
        "Contribuable", on_delete=models.CASCADE, related_name="codes"
    )
    purpose = models.CharField(max_length=10, choices=PURPOSES)
    code_hash = models.CharField(max_length=128)
    created = models.DateTimeField(auto_now_add=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)

    class Meta:
        db_table = "verification_code"