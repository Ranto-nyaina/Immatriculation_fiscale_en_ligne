-- ============================================================
-- PRENIF - DONNEES DE TEST
-- ============================================================
-- 20 opérateurs
-- 10 contribuables avec comptes
-- 10 contenus de civisme fiscal
-- 20 transactions CentralRecette
-- 20 paiements
--
-- Compte de test :
-- Email    : test01@prenif.mg ... test10@prenif.mg
-- Mot de passe : Test@123456
--
-- IMPORTANT :
-- Les mots de passe sont déjà hashés avec PBKDF2-SHA256
-- compatible avec Django.
-- ============================================================


-- ============================================================
-- 1. GENRE
-- Table : genre
-- ============================================================

INSERT INTO genre (id, genre)
VALUES
    (1, 'Homme'),
    (2, 'Femme')
ON CONFLICT (id) DO UPDATE SET
    genre = EXCLUDED.genre;


-- ============================================================
-- 2. LOGICIEL
-- Table : logiciel
-- ============================================================

INSERT INTO logiciel (id, logiciel)
VALUES
    (1, 'SIGTAS-TEST'),
    (2, 'HETRAONLINE-TEST'),
    (3, 'SURF-TEST')
ON CONFLICT (id) DO UPDATE SET
    logiciel = EXCLUDED.logiciel;


-- ============================================================
-- 3. MODE DE PAIEMENT
-- Table : mode_paiement
-- ============================================================

INSERT INTO mode_paiement (id, sens)
VALUES
    (1, 'espece'),
    (2, 'virement'),
    (3, 'depot'),
    (4, 'declaration')
ON CONFLICT (id) DO UPDATE SET
    sens = EXCLUDED.sens;


-- ============================================================
-- 4. NUMERO D'IMPOT
-- Table : num_impot
-- ============================================================

INSERT INTO num_impot (id, impot, numero)
VALUES
    (1, 'IRSA', 5),
    (2, 'IR', 10),
    (3, 'IS', 15),
    (4, 'AMENDE', 43),
    (5, 'PENALITE', 44)
ON CONFLICT (id) DO UPDATE SET
    impot = EXCLUDED.impot,
    numero = EXCLUDED.numero;


-- ============================================================
-- 5. OPERATEURS
-- Table : operateur
--
-- ATTENTION :
-- Le modèle Operateur ne possède pas id_operateur.
-- Django crée automatiquement la colonne "id".
-- ============================================================

INSERT INTO operateur
    (id, propr_cin, propr_contact, propr_name, last_name)
VALUES
    (1,  '101000000001', '0320100001', 'Rakoto', 'Jean'),
    (2,  '101000000002', '0320100002', 'Rabe', 'Paul'),
    (3,  '101000000003', '0320100003', 'Ranaivo', 'Luc'),
    (4,  '101000000004', '0320100004', 'Randria', 'Marc'),
    (5,  '101000000005', '0320100005', 'Razafindrakoto', 'Eric'),
    (6,  '101000000006', '0320100006', 'Andrianina', 'Hery'),
    (7,  '101000000007', '0320100007', 'Rakotomalala', 'Faly'),
    (8,  '101000000008', '0320100008', 'Rasolofonirina', 'Tojo'),
    (9,  '101000000009', '0320100009', 'Raharison', 'Mamy'),
    (10, '101000000010', '0320100010', 'Razanamihaja', 'Nirina'),
    (11, '101000000011', '0320100011', 'Andriamihaja', 'Tiana'),
    (12, '101000000012', '0320100012', 'Rakotonirina', 'David'),
    (13, '101000000013', '0320100013', 'Rajaonarivelo', 'Olivier'),
    (14, '101000000014', '0320100014', 'Randrianasolo', 'Kevin'),
    (15, '101000000015', '0320100015', 'Ravelomanana', 'Ando'),
    (16, '101000000016', '0320100016', 'Razafindramaro', 'Dina'),
    (17, '101000000017', '0320100017', 'Andrianjafy', 'Mickael'),
    (18, '101000000018', '0320100018', 'Rakotoarisoa', 'Nantenaina'),
    (19, '101000000019', '0320100019', 'Rasoanaivo', 'Hasina'),
    (20, '101000000020', '0320100020', 'Rajaonarison', 'Fetra')
ON CONFLICT (id) DO UPDATE SET
    propr_cin = EXCLUDED.propr_cin,
    propr_contact = EXCLUDED.propr_contact,
    propr_name = EXCLUDED.propr_name,
    last_name = EXCLUDED.last_name;

-- ============================================================
-- 6. CONTRIBUABLES
-- Table : contribuable
--
-- 10 contribuables possèdent un compte.
--
-- Mot de passe :
-- Test@123456
--
-- Hash Django :
-- $pbkdf2_sha256$600000$preniftest$
-- hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI=
-- ============================================================

INSERT INTO contribuable
(
    id_contribuable,
    create_date,
    dm_cin,
    propr_name,
    last_name,
    sexe,
    birth_date,
    birth_place,
    sit_matrim,
    propr_cin,
    delivr_cin_date,
    cin_place,
    propr_contact,
    mailing_address,
    bank_acct_no,
    passeport,
    dm_ref,
    propr_prenif,
    statistic_no,
    statistic_date,
    fkt_no,
    photo,
    password
)
VALUES

(
    1,
    '2026-01-01',
    '101100001',
    'Rakoto',
    'Jean',
    1,
    '1995-01-15',
    'Antananarivo',
    1,
    '101100001',
    '2015-03-10',
    'Antananarivo',
    '0321100001',
    'test01@prenif.mg',
    'MG000001',
    NULL,
    'REF001',
    'PRENIF001',
    'STAT001',
    '2020-01-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    2,
    '2026-01-01',
    '101100002',
    'Rabe',
    'Paul',
    1,
    '1994-02-20',
    'Fianarantsoa',
    2,
    '101100002',
    '2014-04-12',
    'Fianarantsoa',
    '0321100002',
    'test02@prenif.mg',
    'MG000002',
    NULL,
    'REF002',
    'PRENIF002',
    'STAT002',
    '2020-02-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    3,
    '2026-01-01',
    '101100003',
    'Ranaivo',
    'Luc',
    1,
    '1993-03-25',
    'Toamasina',
    1,
    '101100003',
    '2013-05-15',
    'Toamasina',
    '0321100003',
    'test03@prenif.mg',
    'MG000003',
    NULL,
    'REF003',
    'PRENIF003',
    'STAT003',
    '2020-03-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    4,
    '2026-01-01',
    '101100004',
    'Randria',
    'Marc',
    1,
    '1992-04-10',
    'Mahajanga',
    2,
    '101100004',
    '2012-06-20',
    'Mahajanga',
    '0321100004',
    'test04@prenif.mg',
    'MG000004',
    NULL,
    'REF004',
    'PRENIF004',
    'STAT004',
    '2020-04-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    5,
    '2026-01-01',
    '101100005',
    'Razafindrakoto',
    'Eric',
    1,
    '1991-05-05',
    'Antsirabe',
    1,
    '101100005',
    '2011-07-10',
    'Antsirabe',
    '0321100005',
    'test05@prenif.mg',
    'MG000005',
    NULL,
    'REF005',
    'PRENIF005',
    'STAT005',
    '2020-05-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    6,
    '2026-01-01',
    '101100006',
    'Andrianina',
    'Hery',
    1,
    '1990-06-18',
    'Antananarivo',
    2,
    '101100006',
    '2010-08-15',
    'Antananarivo',
    '0321100006',
    'test06@prenif.mg',
    'MG000006',
    NULL,
    'REF006',
    'PRENIF006',
    'STAT006',
    '2020-06-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    7,
    '2026-01-01',
    '101100007',
    'Rakotomalala',
    'Faly',
    2,
    '1996-07-22',
    'Fianarantsoa',
    1,
    '101100007',
    '2016-09-10',
    'Fianarantsoa',
    '0321100007',
    'test07@prenif.mg',
    'MG000007',
    NULL,
    'REF007',
    'PRENIF007',
    'STAT007',
    '2020-07-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    8,
    '2026-01-01',
    '101100008',
    'Rasolofonirina',
    'Tojo',
    1,
    '1997-08-30',
    'Toamasina',
    2,
    '101100008',
    '2017-10-12',
    'Toamasina',
    '0321100008',
    'test08@prenif.mg',
    'MG000008',
    NULL,
    'REF008',
    'PRENIF008',
    'STAT008',
    '2020-08-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    9,
    '2026-01-01',
    '101100009',
    'Raharison',
    'Mamy',
    2,
    '1998-09-12',
    'Mahajanga',
    1,
    '101100009',
    '2018-11-20',
    'Mahajanga',
    '0321100009',
    'test09@prenif.mg',
    'MG000009',
    NULL,
    'REF009',
    'PRENIF009',
    'STAT009',
    '2020-09-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
),

(
    10,
    '2026-01-01',
    '101100010',
    'Razanamihaja',
    'Nirina',
    2,
    '1999-10-05',
    'Antsirabe',
    2,
    '101100010',
    '2019-12-15',
    'Antsirabe',
    '0321100010',
    'test10@prenif.mg',
    'MG000010',
    NULL,
    'REF010',
    'PRENIF010',
    'STAT010',
    '2020-10-01',
    NULL,
    NULL,
    '$pbkdf2_sha256$600000$preniftest$hXJ1C9cWovRiiQh0z1EzjTPmfHFNYc3xBjQvse/6KOI='
)

ON CONFLICT (id_contribuable) DO UPDATE SET
    create_date = EXCLUDED.create_date,
    dm_cin = EXCLUDED.dm_cin,
    propr_name = EXCLUDED.propr_name,
    last_name = EXCLUDED.last_name,
    sexe = EXCLUDED.sexe,
    birth_date = EXCLUDED.birth_date,
    birth_place = EXCLUDED.birth_place,
    sit_matrim = EXCLUDED.sit_matrim,
    propr_cin = EXCLUDED.propr_cin,
    delivr_cin_date = EXCLUDED.delivr_cin_date,
    cin_place = EXCLUDED.cin_place,
    propr_contact = EXCLUDED.propr_contact,
    mailing_address = EXCLUDED.mailing_address,
    bank_acct_no = EXCLUDED.bank_acct_no,
    passeport = EXCLUDED.passeport,
    dm_ref = EXCLUDED.dm_ref,
    propr_prenif = EXCLUDED.propr_prenif,
    statistic_no = EXCLUDED.statistic_no,
    statistic_date = EXCLUDED.statistic_date,
    fkt_no = EXCLUDED.fkt_no,
    photo = EXCLUDED.photo,
    password = EXCLUDED.password;


-- ============================================================
-- 7. CIVISME FISCAL
-- Table : civisme_fiscale
-- ============================================================

INSERT INTO civisme_fiscale
(
    id,
    video,
    description,
    question,
    reponse,
    quizz
)
VALUES

(
    1,
    decode('', 'hex'),
    'Comprendre pourquoi les impots sont necessaires au fonctionnement de l Etat.',
    'Pourquoi doit-on payer les impots ?',
    'Pour financer les services publics.',
    $${
        "question": "Pourquoi doit-on payer les impots ?",
        "options": [
            "Pour financer les services publics",
            "Pour obtenir un salaire",
            "Pour ouvrir un compte bancaire"
        ],
        "answer": "Pour financer les services publics"
    }$$::jsonb
),

(
    2,
    decode('', 'hex'),
    'Les impots permettent de financer les infrastructures publiques.',
    'Quel secteur peut etre finance par les impots ?',
    'Les infrastructures publiques.',
    $${
        "question": "Quel secteur peut etre finance par les impots ?",
        "options": [
            "Les infrastructures publiques",
            "Les jeux video",
            "Les achats personnels"
        ],
        "answer": "Les infrastructures publiques"
    }$$::jsonb
),

(
    3,
    decode('', 'hex'),
    'La declaration fiscale permet a l administration de connaitre les obligations fiscales.',
    'Pourquoi declarer ses revenus ?',
    'Pour determiner correctement les obligations fiscales.',
    $${
        "question": "Pourquoi declarer ses revenus ?",
        "options": [
            "Pour determiner correctement les obligations fiscales",
            "Pour obtenir un passeport",
            "Pour ouvrir une boutique"
        ],
        "answer": "Pour determiner correctement les obligations fiscales"
    }$$::jsonb
),

(
    4,
    decode('', 'hex'),
    'Le contribuable doit conserver les documents fiscaux necessaires.',
    'Que doit conserver le contribuable ?',
    'Les justificatifs fiscaux.',
    $${
        "question": "Que doit conserver le contribuable ?",
        "options": [
            "Les justificatifs fiscaux",
            "Uniquement ses photos",
            "Ses jeux"
        ],
        "answer": "Les justificatifs fiscaux"
    }$$::jsonb
),

(
    5,
    decode('', 'hex'),
    'La fiscalite participe au financement des services publics.',
    'Quel est un exemple de service public ?',
    'La sante publique.',
    $${
        "question": "Quel est un exemple de service public ?",
        "options": [
            "La sante publique",
            "Un achat personnel",
            "Un voyage prive"
        ],
        "answer": "La sante publique"
    }$$::jsonb
),

(
    6,
    decode('', 'hex'),
    'Le paiement des impots contribue au developpement du pays.',
    'Quel est un effet du paiement des impots ?',
    'Contribuer au developpement du pays.',
    $${
        "question": "Quel est un effet du paiement des impots ?",
        "options": [
            "Contribuer au developpement du pays",
            "Supprimer les services publics",
            "Eviter toute declaration"
        ],
        "answer": "Contribuer au developpement du pays"
    }$$::jsonb
),

(
    7,
    decode('', 'hex'),
    'La transparence fiscale est importante dans la relation entre administration et contribuables.',
    'Pourquoi la transparence fiscale est-elle importante ?',
    'Elle renforce la confiance.',
    $${
        "question": "Pourquoi la transparence fiscale est-elle importante ?",
        "options": [
            "Elle renforce la confiance",
            "Elle supprime les impots",
            "Elle remplace les declarations"
        ],
        "answer": "Elle renforce la confiance"
    }$$::jsonb
),

(
    8,
    decode('', 'hex'),
    'Le contribuable doit respecter les obligations prevues par la legislation fiscale.',
    'Que doit respecter le contribuable ?',
    'Les obligations fiscales.',
    $${
        "question": "Que doit respecter le contribuable ?",
        "options": [
            "Les obligations fiscales",
            "Uniquement les obligations bancaires",
            "Aucune regle"
        ],
        "answer": "Les obligations fiscales"
    }$$::jsonb
),

(
    9,
    decode('', 'hex'),
    'Les recettes fiscales peuvent contribuer au financement des collectivites.',
    'A quoi peuvent servir les recettes fiscales ?',
    'Au financement des collectivites et services publics.',
    $${
        "question": "A quoi peuvent servir les recettes fiscales ?",
        "options": [
            "Au financement des collectivites et services publics",
            "A supprimer les collectivites",
            "A financer uniquement les depenses personnelles"
        ],
        "answer": "Au financement des collectivites et services publics"
    }$$::jsonb
),

(
    10,
    decode('', 'hex'),
    'Le civisme fiscal repose notamment sur le respect des obligations fiscales.',
    'Qu est-ce que le civisme fiscal ?',
    'Le respect volontaire des obligations fiscales.',
    $${
        "question": "Qu est-ce que le civisme fiscal ?",
        "options": [
            "Le respect volontaire des obligations fiscales",
            "Le refus de toute declaration",
            "Le non-paiement des impots"
        ],
        "answer": "Le respect volontaire des obligations fiscales"
    }$$::jsonb
)

ON CONFLICT (id) DO UPDATE SET
    video = EXCLUDED.video,
    description = EXCLUDED.description,
    question = EXCLUDED.question,
    reponse = EXCLUDED.reponse,
    quizz = EXCLUDED.quizz;


-- ============================================================
-- 8. CENTRAL RECETTE
-- Table : central_recette
-- ============================================================

INSERT INTO central_recette
(
    id_transaction,
    id_contribuable_id,
    id_centre_recette,
    regisseur,
    logiciel_id,
    ref_trans,
    ref_reglement,
    daty,
    mouvement,
    moyen_paiement,
    rib,
    prenif,
    raison_sociale,
    nimp_id,
    numrec,
    libelle,
    flag,
    date_debut,
    date_fin,
    periode,
    periode2,
    mnt_ap,
    base,
    imp_detail,
    da,
    banque,
    annee_recouvrement,
    code_bureau,
    libelle_bureau
)
VALUES

(
    1, 1, 'CR-ANT-001', 'REG001', 1,
    'TRX-2026-0001', 'REG-2026-0001', '2026-01-15',
    '0', '01', 'RIB000001', 'PRENIF001', 'Rakoto Jean',
    1, 1001, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    150000.00, 150000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    2, 1, 'CR-ANT-001', 'REG001', 2,
    'TRX-2026-0002', 'REG-2026-0002', '2026-07-15',
    '0', '02', 'RIB000001', 'PRENIF001', 'Rakoto Jean',
    2, 1002, 'IR', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    200000.00, 200000.00, 'IR - Juillet 2026',
    1, 'BOA', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    3, 2, 'CR-FIA-001', 'REG002', 1,
    'TRX-2026-0003', 'REG-2026-0003', '2026-01-18',
    '0', '01', 'RIB000002', 'PRENIF002', 'Rabe Paul',
    1, 1003, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    125000.00, 125000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B002', 'Centre Recette Fianarantsoa'
),

(
    4, 2, 'CR-FIA-001', 'REG002', 3,
    'TRX-2026-0004', 'REG-2026-0004', '2026-07-18',
    '0', '02', 'RIB000002', 'PRENIF002', 'Rabe Paul',
    3, 1004, 'IS', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    300000.00, 300000.00, 'IS - Juillet 2026',
    1, 'BOA', 2026, 'B002', 'Centre Recette Fianarantsoa'
),

(
    5, 3, 'CR-TOA-001', 'REG003', 1,
    'TRX-2026-0005', 'REG-2026-0005', '2026-01-20',
    '0', '03', 'RIB000003', 'PRENIF003', 'Ranaivo Luc',
    1, 1005, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    180000.00, 180000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B003', 'Centre Recette Toamasina'
),

(
    6, 3, 'CR-TOA-001', 'REG003', 2,
    'TRX-2026-0006', 'REG-2026-0006', '2026-07-20',
    '0', '04', 'RIB000003', 'PRENIF003', 'Ranaivo Luc',
    2, 1006, 'IR', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    210000.00, 210000.00, 'IR - Juillet 2026',
    1, 'BOA', 2026, 'B003', 'Centre Recette Toamasina'
),

(
    7, 4, 'CR-MAJ-001', 'REG004', 1,
    'TRX-2026-0007', 'REG-2026-0007', '2026-01-22',
    '0', '01', 'RIB000004', 'PRENIF004', 'Randria Marc',
    1, 1007, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    175000.00, 175000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B004', 'Centre Recette Mahajanga'
),

(
    8, 4, 'CR-MAJ-001', 'REG004', 3,
    'TRX-2026-0008', 'REG-2026-0008', '2026-07-22',
    '0', '02', 'RIB000004', 'PRENIF004', 'Randria Marc',
    3, 1008, 'IS', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    350000.00, 350000.00, 'IS - Juillet 2026',
    1, 'BOA', 2026, 'B004', 'Centre Recette Mahajanga'
),

(
    9, 5, 'CR-ANT-001', 'REG005', 1,
    'TRX-2026-0009', 'REG-2026-0009', '2026-01-25',
    '0', '03', 'RIB000005', 'PRENIF005', 'Razafindrakoto Eric',
    1, 1009, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    160000.00, 160000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    10, 5, 'CR-ANT-001', 'REG005', 2,
    'TRX-2026-0010', 'REG-2026-0010', '2026-07-25',
    '0', '04', 'RIB000005', 'PRENIF005', 'Razafindrakoto Eric',
    2, 1010, 'IR', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    225000.00, 225000.00, 'IR - Juillet 2026',
    1, 'BOA', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    11, 6, 'CR-ANT-001', 'REG006', 1,
    'TRX-2026-0011', 'REG-2026-0011', '2026-01-28',
    '0', '01', 'RIB000006', 'PRENIF006', 'Andrianina Hery',
    1, 1011, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    190000.00, 190000.00, 'IRSA - Janvier 2026',
    1, 'BNI', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    12, 6, 'CR-ANT-001', 'REG006', 3,
    'TRX-2026-0012', 'REG-2026-0012', '2026-07-28',
    '0', '02', 'RIB000006', 'PRENIF006', 'Andrianina Hery',
    3, 1012, 'IS', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    325000.00, 325000.00, 'IS - Juillet 2026',
    1, 'BOA', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    13, 7, 'CR-FIA-001', 'REG007', 1,
    'TRX-2026-0013', 'REG-2026-0013', '2026-02-01',
    '0', '03', 'RIB000007', 'PRENIF007', 'Rakotomalala Faly',
    1, 1013, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    145000.00, 145000.00, 'IRSA - Fevrier 2026',
    1, 'BNI', 2026, 'B002', 'Centre Recette Fianarantsoa'
),

(
    14, 7, 'CR-FIA-001', 'REG007', 2,
    'TRX-2026-0014', 'REG-2026-0014', '2026-08-01',
    '0', '04', 'RIB000007', 'PRENIF007', 'Rakotomalala Faly',
    2, 1014, 'IR', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    215000.00, 215000.00, 'IR - Aout 2026',
    1, 'BOA', 2026, 'B002', 'Centre Recette Fianarantsoa'
),

(
    15, 8, 'CR-TOA-001', 'REG008', 1,
    'TRX-2026-0015', 'REG-2026-0015', '2026-02-05',
    '0', '01', 'RIB000008', 'PRENIF008', 'Rasolofonirina Tojo',
    1, 1015, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    155000.00, 155000.00, 'IRSA - Fevrier 2026',
    1, 'BNI', 2026, 'B003', 'Centre Recette Toamasina'
),

(
    16, 8, 'CR-TOA-001', 'REG008', 3,
    'TRX-2026-0016', 'REG-2026-0016', '2026-08-05',
    '0', '02', 'RIB000008', 'PRENIF008', 'Rasolofonirina Tojo',
    3, 1016, 'IS', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    285000.00, 285000.00, 'IS - Aout 2026',
    1, 'BOA', 2026, 'B003', 'Centre Recette Toamasina'
),

(
    17, 9, 'CR-MAJ-001', 'REG009', 1,
    'TRX-2026-0017', 'REG-2026-0017', '2026-02-10',
    '0', '03', 'RIB000009', 'PRENIF009', 'Raharison Mamy',
    1, 1017, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    165000.00, 165000.00, 'IRSA - Fevrier 2026',
    1, 'BNI', 2026, 'B004', 'Centre Recette Mahajanga'
),

(
    18, 9, 'CR-MAJ-001', 'REG009', 2,
    'TRX-2026-0018', 'REG-2026-0018', '2026-08-10',
    '0', '04', 'RIB000009', 'PRENIF009', 'Raharison Mamy',
    2, 1018, 'IR', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    230000.00, 230000.00, 'IR - Aout 2026',
    1, 'BOA', 2026, 'B004', 'Centre Recette Mahajanga'
),

(
    19, 10, 'CR-ANT-001', 'REG010', 1,
    'TRX-2026-0019', 'REG-2026-0019', '2026-02-15',
    '0', '01', 'RIB000010', 'PRENIF010', 'Razanamihaja Nirina',
    1, 1019, 'IRSA', 'N',
    '2026-01-01', '2026-03-30', 1, NULL,
    175000.00, 175000.00, 'IRSA - Fevrier 2026',
    1, 'BNI', 2026, 'B001', 'Centre Recette Antananarivo'
),

(
    20, 10, 'CR-ANT-001', 'REG010', 3,
    'TRX-2026-0020', 'REG-2026-0020', '2026-08-15',
    '0', '02', 'RIB000010', 'PRENIF010', 'Razanamihaja Nirina',
    3, 1020, 'IS', 'N',
    '2026-07-01', '2026-09-30', 2, NULL,
    310000.00, 310000.00, 'IS - Aout 2026',
    1, 'BOA', 2026, 'B001', 'Centre Recette Antananarivo'
)

ON CONFLICT (id_transaction) DO UPDATE SET
    id_contribuable_id = EXCLUDED.id_contribuable_id,
    id_centre_recette = EXCLUDED.id_centre_recette,
    regisseur = EXCLUDED.regisseur,
    logiciel_id = EXCLUDED.logiciel_id,
    ref_trans = EXCLUDED.ref_trans,
    ref_reglement = EXCLUDED.ref_reglement,
    daty = EXCLUDED.daty,
    mouvement = EXCLUDED.mouvement,
    moyen_paiement = EXCLUDED.moyen_paiement,
    rib = EXCLUDED.rib,
    prenif = EXCLUDED.prenif,
    raison_sociale = EXCLUDED.raison_sociale,
    nimp_id = EXCLUDED.nimp_id,
    numrec = EXCLUDED.numrec,
    libelle = EXCLUDED.libelle,
    flag = EXCLUDED.flag,
    date_debut = EXCLUDED.date_debut,
    date_fin = EXCLUDED.date_fin,
    periode = EXCLUDED.periode,
    periode2 = EXCLUDED.periode2,
    mnt_ap = EXCLUDED.mnt_ap,
    base = EXCLUDED.base,
    imp_detail = EXCLUDED.imp_detail,
    da = EXCLUDED.da,
    banque = EXCLUDED.banque,
    annee_recouvrement = EXCLUDED.annee_recouvrement,
    code_bureau = EXCLUDED.code_bureau,
    libelle_bureau = EXCLUDED.libelle_bureau;


-- ============================================================
-- 9. PAIEMENTS
-- Table : paiement
-- ============================================================

INSERT INTO paiement
(
    id_contribuable_id,
    central_recette_id,
    mode_paiement_id,
    n_quit,
    montant,
    date_paiement
)
VALUES
    (1,  1,  1, 'QUIT-2026-0001', 150000.00, '2026-01-16'),
    (1,  2,  2, 'QUIT-2026-0002', 200000.00, '2026-07-16'),

    (2,  3,  3, 'QUIT-2026-0003', 125000.00, '2026-01-19'),
    (2,  4,  4, 'QUIT-2026-0004', 300000.00, '2026-07-19'),

    (3,  5,  1, 'QUIT-2026-0005', 180000.00, '2026-01-21'),
    (3,  6,  2, 'QUIT-2026-0006', 210000.00, '2026-07-21'),

    (4,  7,  3, 'QUIT-2026-0007', 175000.00, '2026-01-23'),
    (4,  8,  4, 'QUIT-2026-0008', 350000.00, '2026-07-23'),

    (5,  9,  1, 'QUIT-2026-0009', 160000.00, '2026-01-26'),
    (5,  10, 2, 'QUIT-2026-0010', 225000.00, '2026-07-26'),

    (6,  11, 1, 'QUIT-2026-0011', 190000.00, '2026-01-29'),
    (6,  12, 2, 'QUIT-2026-0012', 325000.00, '2026-07-29'),

    (7,  13, 3, 'QUIT-2026-0013', 145000.00, '2026-02-02'),
    (7,  14, 4, 'QUIT-2026-0014', 215000.00, '2026-08-02'),

    (8,  15, 1, 'QUIT-2026-0015', 155000.00, '2026-02-06'),
    (8,  16, 2, 'QUIT-2026-0016', 285000.00, '2026-08-06'),

    (9,  17, 3, 'QUIT-2026-0017', 165000.00, '2026-02-11'),
    (9,  18, 4, 'QUIT-2026-0018', 230000.00, '2026-08-11'),

    (10, 19, 1, 'QUIT-2026-0019', 175000.00, '2026-02-16'),
    (10, 20, 2, 'QUIT-2026-0020', 310000.00, '2026-08-16');


-- ============================================================
-- 10. REINITIALISATION DES SEQUENCES
-- ============================================================

SELECT setval(
    pg_get_serial_sequence('genre', 'id'),
    COALESCE((SELECT MAX(id) FROM genre), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('logiciel', 'id'),
    COALESCE((SELECT MAX(id) FROM logiciel), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('mode_paiement', 'id'),
    COALESCE((SELECT MAX(id) FROM mode_paiement), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('num_impot', 'id'),
    COALESCE((SELECT MAX(id) FROM num_impot), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('operateur', 'id'),
    COALESCE((SELECT MAX(id) FROM operateur), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('contribuable', 'id_contribuable'),
    COALESCE((SELECT MAX(id_contribuable) FROM contribuable), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('civisme_fiscale', 'id'),
    COALESCE((SELECT MAX(id) FROM civisme_fiscale), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('central_recette', 'id_transaction'),
    COALESCE((SELECT MAX(id_transaction) FROM central_recette), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('paiement', 'id'),
    COALESCE((SELECT MAX(id) FROM paiement), 1),
    true
);


-- ============================================================
-- 11. VERIFICATIONS
-- ============================================================

SELECT 'genre' AS table_name, COUNT(*) AS total
FROM genre;

SELECT 'logiciel' AS table_name, COUNT(*) AS total
FROM logiciel;

SELECT 'mode_paiement' AS table_name, COUNT(*) AS total
FROM mode_paiement;

SELECT 'num_impot' AS table_name, COUNT(*) AS total
FROM num_impot;

SELECT 'operateur' AS table_name, COUNT(*) AS total
FROM operateur;

SELECT 'contribuable' AS table_name, COUNT(*) AS total
FROM contribuable;

SELECT 'civisme_fiscale' AS table_name, COUNT(*) AS total
FROM civisme_fiscale;

SELECT 'central_recette' AS table_name, COUNT(*) AS total
FROM central_recette;

SELECT 'paiement' AS table_name, COUNT(*) AS total
FROM paiement;


-- ============================================================
-- 12. VERIFICATION DES COMPTES CONTRIBUABLES
-- ============================================================

SELECT
    id_contribuable,
    dm_cin,
    propr_name,
    last_name,
    mailing_address,
    sexe
FROM contribuable
ORDER BY id_contribuable;


-- ============================================================
-- 13. VERIFICATION HISTORIQUE
-- ============================================================

SELECT
    cr.id_transaction,
    cr.id_contribuable_id,
    c.propr_name,
    c.last_name,
    cr.daty,
    cr.libelle,
    cr.mnt_ap,
    cr.annee_recouvrement
FROM central_recette cr
INNER JOIN contribuable c
    ON c.id_contribuable = cr.id_contribuable_id
ORDER BY cr.id_transaction;


-- ============================================================
-- 14. VERIFICATION PAIEMENTS
-- ============================================================

SELECT
    p.id,
    p.id_contribuable_id,
    p.central_recette_id,
    p.mode_paiement_id,
    p.n_quit,
    p.montant,
    p.date_paiement
FROM paiement p
ORDER BY p.id;


-- ============================================================
-- 15. VERIFICATION CIVISME FISCAL
-- ============================================================

SELECT
    id,
    description,
    question,
    reponse,
    quizz
FROM civisme_fiscale
ORDER BY id;


-- ============================================================
-- FIN DU FICHIER
-- ============================================================