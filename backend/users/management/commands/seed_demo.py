"""
Données de DÉMONSTRATION (fictives) pour tester l'application.

    python manage.py seed_demo
        → crée les référentiels (logiciels, modes de paiement, impôts)
          et 2 opérateurs fictifs qui permettent de tester l'inscription.

    python manage.py seed_demo --prenif 1123456789
        → ajoute en plus des paiements fictifs (2022 à 2024) au
          contribuable ayant ce PRENIF, pour tester l'historique et l'histogramme.

La commande peut être relancée sans créer de doublons.
Ne jamais l'utiliser avec de vraies données de contribuables.
"""

import datetime

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from users.models import (
    CentralRecette,
    Contribuable,
    Logiciel,
    ModePaiement,
    NumImpot,
    Operateur,
    Paiement,
)

LOGICIELS = ["SURF", "SIGTAS", "HETRAONLINE"]
MODES_PAIEMENT = ["depot", "declaration", "espece", "virement"]
IMPOTS = [("IRSA", 5), ("IR", 10), ("IS", 15), ("AMENDE", 43), ("PENALITE", 44)]

# (CIN à 12 chiffres, contact, prénom, nom) : personnes FICTIVES
OPERATEURS = [
    ("101012345678", "0341100001", "Jean", "Rakoto"),
    ("102023456789", "0331100002", "Miora", "Rabe"),
]

# (année, impôt, montant, mode de paiement, mois du paiement)
PAIEMENTS = [
    (2022, "IRSA", 120000.0, "espece", 3),
    (2022, "IR", 45000.5, "virement", 9),
    (2023, "IRSA", 130000.0, "espece", 3),
    (2023, "IR", 60000.0, "depot", 10),
    (2024, "IRSA", 90000.0, "virement", 4),
]


class Command(BaseCommand):
    help = "Crée des données de démonstration fictives (référentiels, opérateurs, paiements)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--prenif",
            help="PRENIF d'un contribuable existant auquel ajouter des paiements fictifs.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        logiciel = self._referentiels()
        self._operateurs()

        prenif = options.get("prenif")
        if prenif:
            self._paiements(prenif, logiciel)

        self.stdout.write(self.style.SUCCESS("Données de démonstration prêtes."))

    def _referentiels(self):
        for nom in LOGICIELS:
            Logiciel.objects.get_or_create(logiciel=nom)
        for sens in MODES_PAIEMENT:
            ModePaiement.objects.get_or_create(sens=sens)
        for nom, numero in IMPOTS:
            NumImpot.objects.get_or_create(impot=nom, numero=numero)
        self.stdout.write("Référentiels : OK")
        return Logiciel.objects.get(logiciel="SURF")

    def _operateurs(self):
        for cin, contact, prenom, nom in OPERATEURS:
            Operateur.objects.get_or_create(
                propr_cin=cin,
                defaults={"propr_contact": contact, "propr_name": prenom, "last_name": nom},
            )
        self.stdout.write("Opérateurs fictifs pour tester l'inscription :")
        for cin, contact, prenom, nom in OPERATEURS:
            self.stdout.write(f"  CIN {cin} | contact {contact} | {prenom} {nom}")

    def _paiements(self, prenif, logiciel):
        contribuable = Contribuable.objects.filter(propr_prenif=prenif).first()
        if contribuable is None:
            raise CommandError(f"Aucun contribuable avec le PRENIF {prenif}. Inscris-toi d'abord dans l'application.")

        crees = 0
        for i, (annee, impot, montant, mode, mois) in enumerate(PAIEMENTS, start=1):
            n_quit = f"DEMO-{prenif}-{annee}-{i}"
            if Paiement.objects.filter(n_quit=n_quit).exists():
                continue

            recette = CentralRecette.objects.create(
                id_contribuable=contribuable,
                id_centre_recette=f"DEMO-{n_quit}",
                logiciel=logiciel,
                ref_trans=n_quit,
                ref_reglement=n_quit,
                daty=datetime.date(annee, mois, 1),
                nimp=NumImpot.objects.get(impot=impot),
                numrec=i,
                libelle=impot,
                date_debut=datetime.date(annee, 1, 1),
                date_fin=datetime.date(annee, 12, 31),
                mnt_ap=montant,
                base=montant * 10,
                imp_detail=f"Impôt {impot} {annee} (démo)",
                annee_recouvrement=annee,
                code_bureau="DEMO",
                libelle_bureau="Centre fiscal de démonstration",
            )
            paiement = Paiement.objects.create(
                id_contribuable=contribuable,
                central_recette=recette,
                mode_paiement=ModePaiement.objects.get(sens=mode),
                n_quit=n_quit,
                montant=montant,
            )
            # date_paiement est en auto_now_add : create() la force à « aujourd'hui ».
            # update() permet de fixer la vraie date (pour avoir plusieurs années).
            Paiement.objects.filter(pk=paiement.pk).update(
                date_paiement=datetime.date(annee, mois, 15)
            )
            crees += 1

        self.stdout.write(f"Paiements fictifs ajoutés : {crees}")
