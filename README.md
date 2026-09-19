# 🧾 Application mobile d'immatriculation fiscale en ligne

Application mobile permettant aux personnes physiques de s'immatriculer fiscalement en ligne et de consulter leurs transactions dans un espace contribuable.

Projet réalisé pour la **Direction Générale des Impôts (DGI)** de Madagascar, au sein du Service du Système d'Information Fiscale (SSIF), dans le cadre d'un stage de 3 mois.

> Mémoire de fin d'études — Licence professionnelle, mention Informatique, parcours Informatique Générale
> École Nationale d'Informatique (ENI), Université de Fianarantsoa — année universitaire 2023-2024

---

## 🎯 Contexte et objectif

Aujourd'hui, un contribuable doit se déplacer au centre fiscal pour déposer son dossier d'immatriculation. Lors de l'activité *ANJARA HETRAKO*, les agents de la DGI se déplacent et procèdent à l'immatriculation de façon manuelle, sur papier.

Un logiciel en ligne existe déjà (NIFONLINE). Il est sécurisé et efficace, mais :

- il n'est pas conçu pour les personnes sans activité professionnelle ;
- il est jugé trop complexe et demande beaucoup de temps ;
- certaines étapes de vérification des dossiers sont encore faites par des agents.

**Objectif :** augmenter le nombre de contribuables à Madagascar, notamment parmi les travailleurs informels, en rendant l'immatriculation simple et accessible depuis un téléphone.

---

## ✨ Fonctionnalités

Les cas d'utilisation sont classés par ordre de priorité :

| Priorité | Fonctionnalité | Acteur(s) | Description |
|---|---|---|---|
| 1 | S'authentifier | Contribuable, administrateur | Connexion par identifiants, puis code de vérification envoyé par e-mail (double authentification) ; accès à l'API protégé par token |
| 2 | S'inscrire | Contribuable | Inscription en ligne et obtention d'un numéro PRENIF |
| 3 | Visualiser ses transactions | Contribuable | Historique des transactions, détail, et tableau de bord avec histogramme |
| 4 | Modifier ses informations | Contribuable | Modification du profil et de la photo depuis la page Paramètres |
| 5 | Envoyer un message | Contribuable, administrateur | Questions et demandes d'aide au service d'aide |

> **PRENIF :** numéro unique attribué à chaque contribuable pour l'identification fiscale.

---

## 🏗️ Architecture

L'application suit une **architecture 3-tiers** et communique par une **API REST** (échanges en JSON).

```text
┌─────────────────────────────┐
│  Couche présentation        │
│  React Native + Expo Go     │
└──────────────┬──────────────┘
               │  API REST (JSON)
               ▼
┌─────────────────────────────┐
│  Couche métier              │
│  Django (Python)            │
└──────────────┬──────────────┘
               │  ORM
               ▼
┌─────────────────────────────┐
│  Couche données             │
│  PostgreSQL                 │
└─────────────────────────────┘
```

---

## 🛠️ Technologies utilisées

| Domaine | Choix | Alternative comparée dans le mémoire |
|---|---|---|
| Application mobile | React Native (testée avec Expo Go) | Flutter |
| Backend | Python + Django 5 + Django REST Framework | Flask, FastAPI |
| Base de données | PostgreSQL (administrée avec pgAdmin 4) | MySQL |
| Authentification | DRF `TokenAuthentication` (`IsAuthenticated` par défaut sur toute l'API) | — |
| E-mail | SMTP Gmail, pour le code de vérification | — |
| Méthode de conception | UP (Processus Unifié) | Merise |
| Modélisation | UML, avec Visual Paradigm | — |
| Éditeur | Visual Studio Code | — |

---

## 🧠 Modèle de données

Les principales données gérées sont le **contribuable**, ses **transactions** et ses **messages**.

Règles de gestion :

- **RG1 :** un contribuable a un et un seul numéro PRENIF ;
- **RG2 :** un contribuable peut avoir un ou plusieurs contacts ;
- **RG3 :** un contribuable peut faire une ou plusieurs transactions ;
- **RG4 :** un contribuable peut envoyer un ou plusieurs messages.

Données conservées pour un contribuable : identité (nom, prénom, sexe, date et lieu de naissance, situation familiale), CIN (numéro, date et lieu de délivrance), contact, adresse e-mail, lieu de résidence, numéro PRENIF, mot de passe et photo.

Données conservées pour une transaction : identifiant, mode de paiement, montant à payer, numéro de quittance.

Tables principales de la base :

- `contribuable`, `messages` ;
- `central_recette` (transactions issues des logiciels de la DGI), `paiement`, `mode_paiement`, `num_impot`, `logiciel` ;
- un découpage territorial (pays, région, ville, localité, wereda, fokontany).

Trois **vues SQL** alimentent l'historique des transactions, le tableau de bord et les messages : `vue_somme_par_contribuable_par_annee`, `vue_detail_transactions_par_quit_et_contribuable` et `vue_messages`. Les modèles Django correspondants sont en `managed = False` : **les migrations ne créent pas ces vues**, elles doivent exister dans la base avant de lancer l'application (voir Installation).

---

## 🚀 Installation

> ⚠️ Les commandes ci-dessous sont un modèle standard Django + Expo. Adapte les noms de dossiers et de fichiers à ton dépôt.

### Prérequis

- Python 3 et `pip`
- PostgreSQL (avec une base de données créée pour le projet)
- Node.js et `npm`
- L'application **Expo Go** installée sur le téléphone

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows
pip install -r requirements.txt

cp .env.example .env      # sous Windows : copy .env.example .env

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Avant `migrate`, crée la base PostgreSQL (par défaut nommée `nif`).

Après `migrate`, crée les trois vues SQL décrites dans la section « Modèle de données » avec le script SQL du dépôt (`<chemin_du_script_sql>`). Sans elles, l'historique, le tableau de bord et les messages ne fonctionnent pas.

Les secrets ne sont pas dans le code : ils sont lus depuis le fichier `.env`, qui ne doit **jamais** être versionné.

| Variable | Rôle |
|---|---|
| `DJANGO_SECRET_KEY` | clé secrète Django (obligatoire) |
| `DJANGO_DEBUG` | `True` en développement uniquement |
| `DJANGO_ALLOWED_HOSTS` | hôtes autorisés ; ajoute l'IP locale du PC pour tester depuis un téléphone |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | accès à PostgreSQL |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | compte Gmail pour l'envoi du code ; utilise un **mot de passe d'application** |

Toutes les routes de l'API exigent un token (en-tête `Authorization: Token <token>`), sauf l'inscription et la connexion.

### Application mobile

```bash
cd frontend
npm install
npx expo start
```

Scanne ensuite le code QR avec Expo Go pour ouvrir l'application. Le téléphone et l'ordinateur doivent être sur le même réseau, et l'adresse de l'API dans l'application doit pointer vers l'adresse IP locale de la machine qui héberge le backend.

---

## ⚠️ Limites du projet

- L'application n'est décrite que dans un environnement de développement (Expo Go) : aucun déploiement en production n'est documenté ;
- aucun test automatisé n'est documenté ;
- l'application stocke des données personnelles sensibles (CIN, photo, contacts, transactions) : leur protection doit être vérifiée et documentée avant tout usage réel ;
- les tokens DRF standards n'expirent pas : un token volé reste valide tant qu'il n'est pas supprimé ;
- la configuration fournie est prévue pour le développement (base locale, `DEBUG` activable) : un profil de production (HTTPS, hôtes, base dédiée) reste à écrire ;
- l'application cible les personnes physiques uniquement (pas les entreprises).

---

## 🚀 Perspectives d'amélioration

- déployer le backend et publier l'application (Android / iOS) ;
- ajouter des tests unitaires et d'intégration ;
- utiliser des tokens à durée limitée (JWT) et stocker le token côté mobile avec `expo-secure-store` ;
- séparer la configuration développement / production et activer HTTPS ;
- documenter la sécurité des échanges et du stockage des données personnelles ;
- étendre l'application aux personnes morales.

---

## 📚 Compétences mises en œuvre

- Analyse de l'existant et conception UML (cas d'utilisation, diagrammes de séquence et de classes, déploiement)
- Développement mobile multiplateforme (React Native)
- Développement backend et API REST (Python, Django)
- Modélisation et administration d'une base de données (PostgreSQL)
- Gestion de projet en environnement professionnel (stage à la DGI)

---

## 👨‍🎓 Contexte académique

- **Auteur :** FANOMEZANTSOA Rantoniaina Harlivah
- **Établissement :** École Nationale d'Informatique (ENI), Université de Fianarantsoa
- **Diplôme :** Licence professionnelle — Informatique, parcours Informatique Générale
- **Lieu du stage :** Direction Générale des Impôts (DGI), Service du Système d'Information Fiscale
- **Soutenance :** 5 février 2025

---

## 📌 Conclusion

Ce projet propose une chaîne complète, de l'analyse de l'existant à la réalisation d'une application mobile : **Inscription → Obtention du PRENIF → Suivi des transactions → Échange avec le service d'aide**, pour faciliter l'immatriculation fiscale des personnes physiques.
