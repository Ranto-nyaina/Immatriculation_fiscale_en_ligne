
create table genre(
    id serial primary key,
    genre VARCHAR(50)
);


create table SIT_MATRIM(
    id serial primary key,
    Situation VARCHAR(50)
);

-- pays
CREATE TABLE country (
    country_no SERIAL PRIMARY KEY,
    country_name VARCHAR(100),
    country_name_f VARCHAR(20),
    country_name_s VARCHAR(20),
    country_code VARCHAR(4),
    capital VARCHAR(100)
);

-- region
CREATE TABLE parish (
    parish_no SERIAL PRIMARY KEY,
    country_no INT REFERENCES country(country_no),
    parish_name VARCHAR(35),
    parish_name_f VARCHAR(35),
    parish_name_s VARCHAR(35),
    parish_code VARCHAR(4)
);

-- province
CREATE TABLE city (
    city_no SERIAL PRIMARY KEY,
    parish_no INT REFERENCES parish(parish_no),
    city_name VARCHAR(25),
    city_name_f VARCHAR(25),
    city_name_s VARCHAR(25),
    city_code VARCHAR(5),
    city_name_extra VARCHAR(50)
);


-- district
CREATE TABLE locality (
    locality_no SERIAL PRIMARY KEY,
    city_no INT REFERENCES city (city_no),
    locality_desc VARCHAR(30),
    locality_desc_f VARCHAR(30),
    locality_desc_s VARCHAR(30),
    locality_code VARCHAR(6)
);

--commune
CREATE TABLE wereda (
    wereda_no SERIAL PRIMARY KEY,
    locality_no INT REFERENCES LOCALITY (locality_no),
    wereda_desc VARCHAR(50),
    wereda_code INT
);

-- Create table Fokontany
CREATE TABLE FOKONTANY(
    FKT_NO SERIAL PRIMARY KEY, -- Utilisation de SERIAL pour auto-incrémentation et clé primaire
    WEREDA_NO INTEGER REFERENCES WEREDA(WEREDA_NO), 
    FKT_DESC VARCHAR(500)
);

create table operateur(
    id_operateur serial primary key not null,
    cin VARCHAR(220),
    contact VARCHAR(220)
);


CREATE TABLE CONTRIBUABLE(
    ID_CONTRIBUABLE SERIAL PRIMARY KEY, -- Gestion de la clé primaire avec SERIAL
    CREATE_DATE DATE, -- Date de création de la demande
    DM_CIN VARCHAR(15), -- Numéro de carte d'identité nationale (CIN)
    PROPR_NAME VARCHAR(100), -- Nom du propriétaire
    SEX INTEGER REFERENCES genre(id), -- Sexe du demandeur (1 pour homme, 2 pour femme)
    BIRTH_DATE DATE, -- Date de naissance du demandeur
    BIRTH_PLACE VARCHAR(120), -- Lieu de naissance du demandeur
    SIT_MATRIM INTEGER REFERENCES SIT_MATRIM(id), -- Situation matrimoniale (1 pour célibataire, 2 pour marié, etc.)
    PROPR_CIN VARCHAR(15), -- CIN du propriétaire
    -- PROPR_ADDRESS VARCHAR(200), -- Adresse du propriétaire
    DELIVR_CIN_DATE DATE, -- Date de délivrance de la carte d'identité nationale (CIN)
    CIN_PLACE VARCHAR(120), -- Lieu de délivrance de la carte d'identité nationale (CIN)
    PROPR_CONTACT VARCHAR(14), -- Contact du propriétaire
    MAILING_ADDRESS VARCHAR(200), -- Adresse postale
    BANK_ACCT_NO VARCHAR(250), -- Numéro de compte bancaire de l'entreprise
    PASSEPORT VARCHAR(20), -- Numéro de passeport du demandeur
    DM_REF VARCHAR(15), -- Référence de la demande
    PROPR_PRENIF VARCHAR(10), -- Numéro d'identification fiscale du propriétaire 
    STATISTIC_NO VARCHAR(21), -- Numéro statistique
    STATISTIC_DATE DATE, -- Date d'enregistrement statistique
    FKT_NO INTEGER REFERENCES FOKONTANY(FKT_NO), -- Numéro de fokontany, se réfère à la table FOKONTANY
    PASSWORD VARCHAR(50),
    PHOTO VARCHAR(200)
);



-- CREATE TABLE NOTIFICATIONS(
--     id serial primary key,
--     raison int,
--     date 
-- );

CREATE TABLE operateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE message (
    id_message SERIAL PRIMARY KEY,
    contenu TEXT,
    fichier_joint VARCHAR(255),  
    date_envoi TIMESTAMP DEFAULT NOW(),
    id_contribuable INTEGER REFERENCES contribuable(id_contribuable),
    id_operateur INTEGER REFERENCES operateur(id_operateur),
    type_message VARCHAR(20) CHECK (type_message IN ('contribuable', 'operateur'))
);




create table logiciel(
    id serial primary key,
    logiciel VARCHAR(50) --SURF/SIGTAS/HETRAONLINE
);


create table MODE_PAIEMENT(
    id serial primary key,
    sens VARCHAR(100)--depot,declaration,espece,virement
);

create table NUM_IMPOT(
    id serial primary key,
    IMPOT VARCHAR(200),--IRSA=5,IR=10,IS=15,AMENDE=43,PENALITE=44
    numero int
);

-- +NUM_QUITT
-- ao @paiement no misy créance raha indray manao paiement izy de 0
--ajout champ sens dans paiement



CREATE TABLE CENTRAL_RECETTE(
    ID_TRANSACTION serial primary key not null,
    ID_CONTRIBUABLE int REFERENCES CONTRIBUABLE(ID_CONTRIBUABLE),
    ID_CENTRE_RECETTE VARCHAR(200),--NIF+QUIT+CENTRE
    REGISSEUR VARCHAR(50) DEFAULT Null,
    LOGICIEL INT REFERENCES logiciel(id),
    REF_TRANS VARCHAR(60),--
    REF_REGLEMENT VARCHAR(60),--
    DATY DATE,--date 
    MOUVEMENT VARCHAR(1) DEFAULT 0,--1/0
    MOYEN_PAIEMENT VARCHAR(2) default NULL,
    RIB VARCHAR(30),
    PRENIF VARCHAR(20),
    RAISON_SOCIALE VARCHAR(250),
    NIMP int REFERENCES NUM_IMPOT(id),--N° impots
    NUMREC INT,--N° de créance
    LIBELLE VARCHAR(20),--libelle NIMP
    FLAG VARCHAR(1) DEFAULT 'N',
    DATE_DEBUT DATE,--date  début de paiement
    DATE_FIN DATE,--date fin de paiement
    PERIODE int default 1,--periode impots (1 ou 2)
    PERIODE2 VARCHAR(10), 
    MNT_AP DOUBLE PRECISION,--montant à payer
    BASE DOUBLE PRECISION,--BASE DE CALCUL AU LIEU DE CA
    IMP_DETAIL VARCHAR(200),--Nature impôts : declaration,taxation d'office,PV,Titre de perception
    DA int default 0,--Début d'activité 1/0
    BANQUE VARCHAR(75),
    ANNEE_RECOUVREMENT int,--date de recouvrement
    CODE_BUREAU VARCHAR(250),--CODE UNITE OPERATIONNEL()
    LIBELLE_BUREAU VARCHAR(250)--Cetre FISCAL
);

-- \encoding UTF8

create table paiement(
    ID_CONTRIBUABLE int,
    CENTRAL_RECETTE int REFERENCES CENTRAL_RECETTE(ID_TRANSACTION),
    MODE_PAIEMENT int REFERENCES MODE_PAIEMENT(id),
    N_QUIT VARCHAR(50),--Numéro quittance de paiment(N° generer par debut de paiement mais utilisé si on paie encore pour même transaction)
    MONTANT DOUBLE PRECISION,--montant à payer
    date_paiement date
);

CREATE TABLE DIRECTIONS(
    ID_DIRECTION SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour gérer les valeurs uniques
    DIR_REF VARCHAR(40),
    DIR_LIB VARCHAR(100)
);
CREATE UNIQUE INDEX DIRECTIONS_PK ON DIRECTIONS (ID_DIRECTION);


CREATE TABLE AUTHORITY(
    ID_AUTHORITY SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour gérer les valeurs uniques
    AUT_DESIGNATION VARCHAR(50),
    AUT_ROLE INTEGER,
    AUT_CONSULT INTEGER
);


-- Creta table Centre_fiscal
CREATE TABLE CENTRE_FISCAL(
    ID_CENTRE_FISCAL SERIAL PRIMARY KEY, 
    CFL_DESIGNATION VARCHAR(80),
    ID_DIRECTION INTEGER REFERENCES DIRECTIONS(ID_DIRECTION),
    PARISH VARCHAR(50),
    CFL_ABREV VARCHAR(80)
);


-- create table motif_rejet
CREATE TABLE MOTIF_REJET(
    RJT_CODE SERIAL PRIMARY KEY, -- Utilisation de SERIAL pour auto-incrémentation et clé primaire
    RJT_LIBELLE VARCHAR(150)
);

-- create table juridical_form
CREATE TABLE JURIDICAL_FORM(
    JURIDICAL_FORM_NO SERIAL PRIMARY KEY, -- Utilisation de SERIAL pour auto-incrémentation et clé primaire
    JURIDICAL_FORM_ABBR VARCHAR(20),
    JURIDICAL_FORM_ABBR_F VARCHAR(20),
    JURIDICAL_FORM_ABBR_S VARCHAR(20),
    JURIDICAL_FORM_DESC VARCHAR(50),
    JURIDICAL_FORM_DESC_F VARCHAR(50),
    JURIDICAL_FORM_DESC_S VARCHAR(50)
);

-- create table ent_type
CREATE TABLE ENT_TYPE(
    ENT_TYPE_NO SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour gérer les valeurs uniques
    ENT_TYPE_DESC VARCHAR(20),
    ENT_TYPE_DESC_F VARCHAR(20),
    ENT_TYPE_DESC_S VARCHAR(20)
);

-- create table fiscal_regime
CREATE TABLE FISCAL_REGIME(
    FISCAL_REGIME_NO SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour gérer les valeurs uniques
    FISCAL_REGIME_DESC VARCHAR(30),
    FISCAL_REGIME_DESC_F VARCHAR(30),
    FISCAL_REGIME_DESC_S VARCHAR(30)
);


-- sans commercial
create table ACTIVITY(
    ID_ACTIVITY SERIAL PRIMARY KEY, -- Gestion de la clé primaire avec SERIAL
    ID_CONTRIBUABLE int REFERENCES CONTRIBUABLE(ID_CONTRIBUABLE),
    CREATE_DATE DATE , -- Date de création de la demande
    ACTIVITY VARCHAR(800), 
    DETAILS_ACTIVITY VARCHAR(500), 
    FISCAL_REGIME_NO INTEGER, -- Numéro de régime fiscal, se réfère à la table FISCAL_REGIME
    JURIDICAL_FORM_NO INTEGER REFERENCES JURIDICAL_FORM(JURIDICAL_FORM_NO), -- Numéro de forme juridique, se réfère à la table JURIDICAL_FORM
    DM_DATEDEMANDE DATE, -- Date de la demande
    DM_STADE INTEGER, -- Stade actuel de la demande
    DM_DATEVALIDATION DATE, -- Date de validation de la demande
    -- ID_VALID_USER INTEGER, -- Identifiant de l'utilisateur ayant validé la demande, se réfère à la table USERS_NIF
    DM_RAISONSOCIALE VARCHAR(100), -- Raison sociale de l'entreprise
    DM_RESIDENT INTEGER, -- Indique si le demandeur est résident (1 pour oui, 0 pour non)
    CAP_SOCIETE NUMERIC, -- Capital social de l'entreprise
    COM_REG_NO VARCHAR(20), -- Numéro d'enregistrement commercial
    AGREE_DATE DATE, -- Date d'acceptation de la demande
    NOM_COMMERCIAL VARCHAR(200), -- Nom commercial de l'entreprise
    ACRONYME VARCHAR(40), -- Acronyme de l'entreprise
    -- CF_VALID INTEGER, -- Identifiant du centre fiscal validant, se réfère à la table CENTRE_FISCAL
    -- CF_MANAGE VARCHAR(9), -- Identifiant du centre gestionnaire, se réfère à la table CENTRE_GESTIONNAIRE
    AUTH_PUBLIE INTEGER, -- Indicateur si l'autorisation est publiée (1 pour oui, 0 pour non)
    ENT_TYPE_NO INTEGER REFERENCES ENT_TYPE(ENT_TYPE_NO), -- Type d'treprise, se réfère à la table ENT_TYPE
    REG_DATE DATE, -- Date d'enregistrement
    PIECES VARCHAR(20), -- Pièces justificatives fournies
    IMPORTER INTEGER, -- Indique si le demandeur est un importateur (1 pour oui, 0 pour non)
    EXPORTER INTEGER, -- Indique si le demandeur est un exportateur (1 pour oui, 0 pour non)
    PROPRIETAIRE BOOLEAN, -- Indique si le demandeur est propriétaire (TRUE pour oui, FALSE pour non)
    PROPR_TYPE VARCHAR(20), -- Type de propriété (par exemple, individuel, société, etc.)
    -- STATISTIC_NO VARCHAR(21), -- Numéro statistique
    -- STATISTIC_DATE DATE, -- Date d'enregistrement statistique
    DEBUT_EXO VARCHAR(5), -- Date de début d'exercice
    FIN_EXO VARCHAR(5), -- Date de fin d'exercice
    INTERLOCUTOR_NAME VARCHAR(100), -- Nom de l'interlocuteur
    INTERLOCUTOR_TITLE VARCHAR(100), -- Titre de l'interlocuteur
    INTERLOCUTOR_ADDRESS VARCHAR(200), -- Adresse de l'interlocuteur
    INTERLOCUTOR_PHONE VARCHAR(14), -- Téléphone de l'interlocuteur
    INTERLOCUTOR_EMAIL VARCHAR(100), -- Email de l'interlocuteur
    ASSOCIATE_MAJORITY BOOLEAN, -- Indique si le demandeur a une majorité d'associés (TRUE pour oui, FALSE pour non)
    COMPANY_NIF VARCHAR(100), -- Numéro d'identification fiscale de l'entreprise
    NBR_EMPLOYE INTEGER, -- Nombre d'employés de l'entreprise
    PERIODE_GRACE INTEGER, -- Période de grâce en jours
    FKT_NO INTEGER REFERENCES FOKONTANY(FKT_NO), -- Numéro de fokontany, se réfère à la table FOKONTANY
    DURE_EXO INTEGER, -- Durée de l'exercice en mois
    RJT_CODE INTEGER REFERENCES MOTIF_REJET(RJT_CODE), -- Code de motif de rejet, se réfère à la table MOTIF_REJET
    DM_MOTIF_REJET VARCHAR(200) -- Motif du rejet de la demande
);


-- create table users_nif
CREATE TABLE USERS_NIF(
    ID_USER SERIAL PRIMARY KEY,  -- Utilisation de SERIAL pour gérer les valeurs uniques
    ID_CENTRE_FISCAL INTEGER,
    USR_LOGIN VARCHAR(30),
    USR_PASSWORD VARCHAR(100),
    ID_AUTHORITY INTEGER DEFAULT 2,
    TRANSFERT INTEGER,
    BLOQUE INTEGER DEFAULT 0,
    PARISH_NO INTEGER,
    LAST_LOGIN TIMESTAMP,  -- Utilisation de TIMESTAMP pour stocker la date et l'heure
    LAST_IMP_VEHICL TIMESTAMP,
    DATE_ACTIVATE TIMESTAMP,
    NIF_EXPORT VARCHAR(10),
    BNK VARCHAR(20) DEFAULT '0',  -- '0' est une chaîne ici
    CONSTRAINT FK_USERS_NI_APPARTENI_CENTRE_F FOREIGN KEY (ID_CENTRE_FISCAL)
        REFERENCES CENTRE_FISCAL (ID_CENTRE_FISCAL) ON DELETE SET NULL,  -- Ajout d'une option ON DELETE SET NULL
    CONSTRAINT ID_AUTHORITY_FK FOREIGN KEY (ID_AUTHORITY)
        REFERENCES AUTHORITY (ID_AUTHORITY) ON DELETE SET NULL,
    CONSTRAINT USERS_NIF_PARISH_FK1 FOREIGN KEY (PARISH_NO)
        REFERENCES PARISH (PARISH_NO) ON DELETE SET NULL
);

CREATE UNIQUE INDEX PK_USERS_NIF ON USERS_NIF (ID_USER);
CREATE INDEX APPARTENIR_2_FK ON USERS_NIF (ID_CENTRE_FISCAL);

CREATE OR REPLACE FUNCTION insert_sequence_id_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ID_USER IS NULL THEN
        NEW.ID_USER := nextval('id_user_seq');  -- Assurez-vous que cette séquence est créée
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_sequence_id_user
BEFORE INSERT ON USERS_NIF
FOR EACH ROW
EXECUTE FUNCTION insert_sequence_id_user();



UPDATE central_recette
SET 
    date_debut = '2023-01-01',
    date_fin = '2023-12-31',
    imp_detail = 'Taxation d ''office'
WHERE 
    id_transaction IN (2, 3);


