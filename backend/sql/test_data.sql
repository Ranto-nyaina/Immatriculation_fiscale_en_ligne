-- ============================================================
-- PRENIF - DONNEES DE TEST (version corrigée)
-- 10 contribuables + 20 opérateurs + civisme fiscal
-- + transactions/paiements pour historique et histogramme
--
-- Corrections apportées par rapport au fichier d'origine :
--   1) Tables renommées : users_logiciel -> logiciel,
--      users_modepaiement -> mode_paiement, users_numimpot -> num_impot
--      (noms réels d'après users/models.py, Meta.db_table)
--   2) Colonne "id_operateur" retirée de l'INSERT operateur :
--      la vraie clé primaire, générée par Django, s'appelle "id"
--   3) Expressions Python oubliées ("1 if month==1 else 2",
--      "'BNI' if i%2 else 'BOA'") remplacées par des valeurs réelles
--   4) Date invalide '19100-07-16' corrigée en '1990-07-16'
--   5) Mot de passe : un vrai hash Django (pbkdf2_sha256), calculé avec
--      make_password("Test@123456"), pour que ces comptes puissent
--      RÉELLEMENT se connecter dans l'application.
--
-- ⚠️ Applique d'abord le correctif sur Contribuable.password
-- (max_length=128 dans users/models.py) avant d'exécuter ce script,
-- sinon l'INSERT échouera ou tronquera le hash.
--
-- IMPORTANT : exécuter sur une base de TEST.
-- Le script est idempotent pour operateur/contribuable/référentiels
-- (ON CONFLICT ... DO UPDATE) mais PAS pour paiement : le réexécuter
-- dupliquera les paiements. Voir la note en bas de fichier.
-- ============================================================

BEGIN;

-- Tables de référence utilisées par CentralRecette/Paiement
INSERT INTO logiciel (id, logiciel) VALUES
(1,'SIGTAS-TEST'),(2,'HETRAONLINE-TEST'),(3,'SURF-TEST')
ON CONFLICT (id) DO UPDATE SET logiciel=EXCLUDED.logiciel;

INSERT INTO mode_paiement (id, sens) VALUES
(1,'espece'),(2,'virement'),(3,'depot'),(4,'declaration')
ON CONFLICT (id) DO UPDATE SET sens=EXCLUDED.sens;

INSERT INTO num_impot (id, impot, numero) VALUES
(1,'IRSA',5),(2,'IR',10),(3,'IS',15),(4,'AMENDE',43),(5,'PENALITE',44)
ON CONFLICT (id) DO UPDATE SET impot=EXCLUDED.impot, numero=EXCLUDED.numero;

-- 20 OPERATEURS (la clé primaire "id" est générée automatiquement,
-- pas de colonne "id_operateur" dans le vrai schéma Django)
INSERT INTO operateur (propr_cin, propr_contact, propr_name, last_name)
SELECT * FROM (VALUES
('101000000001','0340000001','Jean','Rakoto'),
('101000000002','0340000002','Miora','Rabe'),
('101000000003','0340000003','Andry','Rasolof'),
('101000000004','0340000004','Tiana','Rajaonar'),
('101000000005','0340000005','Hery','Randria'),
('101000000006','0340000006','Fara','Rakotomalala'),
('101000000007','0340000007','Lova','Ramanantsoa'),
('101000000008','0340000008','Nina','Rasoanaivo'),
('101000000009','0340000009','Tojo','Andrianina'),
('101000000010','0340000010','Sarah','Razafindrakoto'),
('101000000011','0340000011','Paul','Rakotozafy'),
('101000000012','0340000012','Mamy','Raharison'),
('101000000013','0340000013','Zo','Randrianasolo'),
('101000000014','0340000014','Aina','Ravelo'),
('101000000015','0340000015','Hanta','Ratsimbazafy'),
('101000000016','0340000016','Faly','Rajaobelina'),
('101000000017','0340000017','Noro','Rakotonirina'),
('101000000018','0340000018','Kanto','Razanadrakoto'),
('101000000019','0340000019','Bodo','Randriamihaja'),
('101000000020','0340000020','Mickael','Rasoarimalala')
) AS t(cin, contact, prenom, nom)
WHERE NOT EXISTS (SELECT 1 FROM operateur WHERE propr_cin = t.cin);

-- 10 CONTRIBUABLES
-- Mot de passe : hash Django réel de "Test@123456" (make_password).
-- Suppose que Contribuable.password est déjà en max_length=128.
INSERT INTO contribuable (id_contribuable,create_date,dm_cin,propr_name,last_name,sex,birth_date,birth_place,sit_matrim,propr_cin,delivr_cin_date,cin_place,propr_contact,mailing_address,bank_acct_no,passeport,dm_ref,propr_prenif,statistic_no,statistic_date,fkt_no,password,photo) VALUES
(1,'2026-09-01',NULL,'Jean','Rakoto',1,'1995-02-11','Antananarivo',1,'101000000001','2015-01-15','Antananarivo','0340000001','test01@prenif.mg','Aucun',NULL,NULL,'100000001',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(2,'2026-09-02',NULL,'Miora','Rabe',2,'1996-03-12','Antsirabe',1,'101000000002','2016-01-15','Antsirabe','0340000002','test02@prenif.mg','Aucun',NULL,NULL,'100000002',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(3,'2026-09-03',NULL,'Andry','Rasolof',1,'1997-04-13','Fianarantsoa',2,'101000000003','2017-01-15','Fianarantsoa','0340000003','test03@prenif.mg','Aucun',NULL,NULL,'100000003',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(4,'2026-09-04',NULL,'Tiana','Rajaonar',2,'1998-05-14','Toamasina',1,'101000000004','2018-01-15','Toamasina','0340000004','test04@prenif.mg','Aucun',NULL,NULL,'100000004',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(5,'2026-09-05',NULL,'Hery','Randria',1,'1999-06-15','Mahajanga',1,'101000000005','2019-01-15','Mahajanga','0340000005','test05@prenif.mg','Aucun',NULL,NULL,'100000005',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(6,'2026-09-06',NULL,'Fara','Rakotomalala',2,'1990-07-16','Antananarivo',2,'101000000006','2020-01-15','Antananarivo','0340000006','test06@prenif.mg','Aucun',NULL,NULL,'100000006',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(7,'2026-09-07',NULL,'Lova','Ramanantsoa',1,'1994-08-17','Antsirabe',1,'101000000007','2021-01-15','Antsirabe','0340000007','test07@prenif.mg','Aucun',NULL,NULL,'100000007',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(8,'2026-09-08',NULL,'Nina','Rasoanaivo',2,'1995-09-18','Fianarantsoa',1,'101000000008','2022-01-15','Fianarantsoa','0340000008','test08@prenif.mg','Aucun',NULL,NULL,'100000008',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(9,'2026-09-09',NULL,'Tojo','Andrianina',1,'1996-10-19','Toamasina',2,'101000000009','2023-01-15','Toamasina','0340000009','test09@prenif.mg','Aucun',NULL,NULL,'100000009',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL),
(10,'2026-09-10',NULL,'Sarah','Razafindrakoto',2,'1997-11-20','Mahajanga',1,'101000000010','2024-01-15','Mahajanga','0340000010','test10@prenif.mg','Aucun',NULL,NULL,'1000000010',NULL,NULL,NULL,'pbkdf2_sha256$1500000$7nvqtHrM5Hjm4xlcsJYDuf$3984BXKXC+EmB9yzDdBUz5aM8KUy1d3Yv7cDGviY/hs=',NULL)
ON CONFLICT (id_contribuable) DO UPDATE SET create_date=EXCLUDED.create_date,propr_name=EXCLUDED.propr_name,last_name=EXCLUDED.last_name,sex=EXCLUDED.sex,birth_date=EXCLUDED.birth_date,birth_place=EXCLUDED.birth_place,sit_matrim=EXCLUDED.sit_matrim,propr_cin=EXCLUDED.propr_cin,delivr_cin_date=EXCLUDED.delivr_cin_date,cin_place=EXCLUDED.cin_place,propr_contact=EXCLUDED.propr_contact,mailing_address=EXCLUDED.mailing_address,bank_acct_no=EXCLUDED.bank_acct_no,propr_prenif=EXCLUDED.propr_prenif,password=EXCLUDED.password;

-- 10 CIVISME FISCALE
INSERT INTO civisme_fiscale (id,video,description,question,reponse,quizz) VALUES
(1,decode('','hex'),'TEST - Question 1','Question de test 1 ?','Réponse de test 1.','{"question":"Question de test 1 ?","options":["Réponse de test 1","Option B","Option C"],"answer":"Réponse de test 1"}'::jsonb),
(2,decode('','hex'),'TEST - Question 2','Question de test 2 ?','Réponse de test 2.','{"question":"Question de test 2 ?","options":["Réponse de test 2","Option B","Option C"],"answer":"Réponse de test 2"}'::jsonb),
(3,decode('','hex'),'TEST - Question 3','Question de test 3 ?','Réponse de test 3.','{"question":"Question de test 3 ?","options":["Réponse de test 3","Option B","Option C"],"answer":"Réponse de test 3"}'::jsonb),
(4,decode('','hex'),'TEST - Question 4','Question de test 4 ?','Réponse de test 4.','{"question":"Question de test 4 ?","options":["Réponse de test 4","Option B","Option C"],"answer":"Réponse de test 4"}'::jsonb),
(5,decode('','hex'),'TEST - Question 5','Question de test 5 ?','Réponse de test 5.','{"question":"Question de test 5 ?","options":["Réponse de test 5","Option B","Option C"],"answer":"Réponse de test 5"}'::jsonb),
(6,decode('','hex'),'TEST - Question 6','Question de test 6 ?','Réponse de test 6.','{"question":"Question de test 6 ?","options":["Réponse de test 6","Option B","Option C"],"answer":"Réponse de test 6"}'::jsonb),
(7,decode('','hex'),'TEST - Question 7','Question de test 7 ?','Réponse de test 7.','{"question":"Question de test 7 ?","options":["Réponse de test 7","Option B","Option C"],"answer":"Réponse de test 7"}'::jsonb),
(8,decode('','hex'),'TEST - Question 8','Question de test 8 ?','Réponse de test 8.','{"question":"Question de test 8 ?","options":["Réponse de test 8","Option B","Option C"],"answer":"Réponse de test 8"}'::jsonb),
(9,decode('','hex'),'TEST - Question 9','Question de test 9 ?','Réponse de test 9.','{"question":"Question de test 9 ?","options":["Réponse de test 9","Option B","Option C"],"answer":"Réponse de test 9"}'::jsonb),
(10,decode('','hex'),'TEST - Question 10','Question de test 10 ?','Réponse de test 10.','{"question":"Question de test 10 ?","options":["Réponse de test 10","Option B","Option C"],"answer":"Réponse de test 10"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET video=EXCLUDED.video,description=EXCLUDED.description,question=EXCLUDED.question,reponse=EXCLUDED.reponse,quizz=EXCLUDED.quizz;

-- 20 CENTRAL_RECETTE : 2 par contribuable
-- periode : 1 pour la 1re transaction du contribuable, 2 pour la 2e (au lieu
-- de l'expression Python "1 if month==1 else 2" laissée par erreur).
-- banque : alterne BNI/BOA (au lieu de "'BNI' if i%2 else 'BOA'").
INSERT INTO central_recette (id_transaction,id_contribuable_id,id_centre_recette,regisseur,logiciel_id,ref_trans,ref_reglement,daty,mouvement,moyen_paiement,rib,prenif,raison_sociale,nimp_id,numrec,libelle,flag,date_debut,date_fin,periode,periode2,mnt_ap,base,imp_detail,da,banque,annee_recouvrement,code_bureau,libelle_bureau) VALUES
(1,1,'CENTRE-001','REG-001',2,'TEST-TRANS-001','TEST-REG-001','2026-01-10','1','01',NULL,'100000001','Jean Rakoto',2,5001,'IR','N','2026-01-01','2026-03-30',1,'T1',105000,1050000,'Declaration',1,'BNI',2026,'BUREAU-001','Centre Fiscal 001'),
(2,1,'CENTRE-001','REG-001',3,'TEST-TRANS-002','TEST-REG-002','2026-07-10','1','02',NULL,'100000001','Jean Rakoto',1,5002,'IRSA','N','2026-07-01','2026-09-30',2,'T3',110000,1100000,'Declaration',1,'BOA',2026,'BUREAU-001','Centre Fiscal 001'),
(3,2,'CENTRE-002','REG-002',1,'TEST-TRANS-003','TEST-REG-003','2026-01-10','1','01',NULL,'100000002','Miora Rabe',2,5003,'IR','N','2026-01-01','2026-03-30',1,'T1',115000,1150000,'Declaration',1,'BNI',2026,'BUREAU-002','Centre Fiscal 002'),
(4,2,'CENTRE-002','REG-002',2,'TEST-TRANS-004','TEST-REG-004','2026-07-10','1','02',NULL,'100000002','Miora Rabe',1,5004,'IRSA','N','2026-07-01','2026-09-30',2,'T3',120000,1200000,'Declaration',1,'BOA',2026,'BUREAU-002','Centre Fiscal 002'),
(5,3,'CENTRE-003','REG-003',3,'TEST-TRANS-005','TEST-REG-005','2026-01-10','1','01',NULL,'100000003','Andry Rasolof',2,5005,'IR','N','2026-01-01','2026-03-30',1,'T1',125000,1250000,'Declaration',1,'BNI',2026,'BUREAU-003','Centre Fiscal 003'),
(6,3,'CENTRE-003','REG-003',1,'TEST-TRANS-006','TEST-REG-006','2026-07-10','1','02',NULL,'100000003','Andry Rasolof',1,5006,'IRSA','N','2026-07-01','2026-09-30',2,'T3',130000,1300000,'Declaration',1,'BOA',2026,'BUREAU-003','Centre Fiscal 003'),
(7,4,'CENTRE-004','REG-004',2,'TEST-TRANS-007','TEST-REG-007','2026-01-10','1','01',NULL,'100000004','Tiana Rajaonar',2,5007,'IR','N','2026-01-01','2026-03-30',1,'T1',135000,1350000,'Declaration',1,'BNI',2026,'BUREAU-004','Centre Fiscal 004'),
(8,4,'CENTRE-004','REG-004',3,'TEST-TRANS-008','TEST-REG-008','2026-07-10','1','02',NULL,'100000004','Tiana Rajaonar',1,5008,'IRSA','N','2026-07-01','2026-09-30',2,'T3',140000,1400000,'Declaration',1,'BOA',2026,'BUREAU-004','Centre Fiscal 004'),
(9,5,'CENTRE-005','REG-005',1,'TEST-TRANS-009','TEST-REG-009','2026-01-10','1','01',NULL,'100000005','Hery Randria',2,5009,'IR','N','2026-01-01','2026-03-30',1,'T1',145000,1450000,'Declaration',1,'BNI',2026,'BUREAU-005','Centre Fiscal 005'),
(10,5,'CENTRE-005','REG-005',2,'TEST-TRANS-010','TEST-REG-010','2026-07-10','1','02',NULL,'100000005','Hery Randria',1,5010,'IRSA','N','2026-07-01','2026-09-30',2,'T3',150000,1500000,'Declaration',1,'BOA',2026,'BUREAU-005','Centre Fiscal 005'),
(11,6,'CENTRE-006','REG-006',3,'TEST-TRANS-011','TEST-REG-011','2026-01-10','1','01',NULL,'100000006','Fara Rakotomalala',2,5011,'IR','N','2026-01-01','2026-03-30',1,'T1',155000,1550000,'Declaration',1,'BNI',2026,'BUREAU-006','Centre Fiscal 006'),
(12,6,'CENTRE-006','REG-006',1,'TEST-TRANS-012','TEST-REG-012','2026-07-10','1','02',NULL,'100000006','Fara Rakotomalala',1,5012,'IRSA','N','2026-07-01','2026-09-30',2,'T3',160000,1600000,'Declaration',1,'BOA',2026,'BUREAU-006','Centre Fiscal 006'),
(13,7,'CENTRE-007','REG-007',2,'TEST-TRANS-013','TEST-REG-013','2026-01-10','1','01',NULL,'100000007','Lova Ramanantsoa',2,5013,'IR','N','2026-01-01','2026-03-30',1,'T1',165000,1650000,'Declaration',1,'BNI',2026,'BUREAU-007','Centre Fiscal 007'),
(14,7,'CENTRE-007','REG-007',3,'TEST-TRANS-014','TEST-REG-014','2026-07-10','1','02',NULL,'100000007','Lova Ramanantsoa',1,5014,'IRSA','N','2026-07-01','2026-09-30',2,'T3',170000,1700000,'Declaration',1,'BOA',2026,'BUREAU-007','Centre Fiscal 007'),
(15,8,'CENTRE-008','REG-008',1,'TEST-TRANS-015','TEST-REG-015','2026-01-10','1','01',NULL,'100000008','Nina Rasoanaivo',2,5015,'IR','N','2026-01-01','2026-03-30',1,'T1',175000,1750000,'Declaration',1,'BNI',2026,'BUREAU-008','Centre Fiscal 008'),
(16,8,'CENTRE-008','REG-008',2,'TEST-TRANS-016','TEST-REG-016','2026-07-10','1','02',NULL,'100000008','Nina Rasoanaivo',1,5016,'IRSA','N','2026-07-01','2026-09-30',2,'T3',180000,1800000,'Declaration',1,'BOA',2026,'BUREAU-008','Centre Fiscal 008'),
(17,9,'CENTRE-009','REG-009',3,'TEST-TRANS-017','TEST-REG-017','2026-01-10','1','01',NULL,'100000009','Tojo Andrianina',2,5017,'IR','N','2026-01-01','2026-03-30',1,'T1',185000,1850000,'Declaration',1,'BNI',2026,'BUREAU-009','Centre Fiscal 009'),
(18,9,'CENTRE-009','REG-009',1,'TEST-TRANS-018','TEST-REG-018','2026-07-10','1','02',NULL,'100000009','Tojo Andrianina',1,5018,'IRSA','N','2026-07-01','2026-09-30',2,'T3',190000,1900000,'Declaration',1,'BOA',2026,'BUREAU-009','Centre Fiscal 009'),
(19,10,'CENTRE-010','REG-010',2,'TEST-TRANS-019','TEST-REG-019','2026-01-10','1','01',NULL,'1000000010','Sarah Razafindrakoto',2,5019,'IR','N','2026-01-01','2026-03-30',1,'T1',195000,1950000,'Declaration',1,'BNI',2026,'BUREAU-010','Centre Fiscal 010'),
(20,10,'CENTRE-010','REG-010',3,'TEST-TRANS-020','TEST-REG-020','2026-07-10','1','02',NULL,'1000000010','Sarah Razafindrakoto',1,5020,'IRSA','N','2026-07-01','2026-09-30',2,'T3',200000,2000000,'Declaration',1,'BOA',2026,'BUREAU-010','Centre Fiscal 010')
ON CONFLICT (id_transaction) DO UPDATE SET id_contribuable_id=EXCLUDED.id_contribuable_id,logiciel_id=EXCLUDED.logiciel_id,ref_trans=EXCLUDED.ref_trans,ref_reglement=EXCLUDED.ref_reglement,daty=EXCLUDED.daty,mouvement=EXCLUDED.mouvement,moyen_paiement=EXCLUDED.moyen_paiement,prenif=EXCLUDED.prenif,raison_sociale=EXCLUDED.raison_sociale,nimp_id=EXCLUDED.nimp_id,numrec=EXCLUDED.numrec,libelle=EXCLUDED.libelle,periode=EXCLUDED.periode,periode2=EXCLUDED.periode2,mnt_ap=EXCLUDED.mnt_ap,base=EXCLUDED.base,imp_detail=EXCLUDED.imp_detail,da=EXCLUDED.da,banque=EXCLUDED.banque,annee_recouvrement=EXCLUDED.annee_recouvrement,code_bureau=EXCLUDED.code_bureau,libelle_bureau=EXCLUDED.libelle_bureau;

-- 20 PAIEMENTS
-- ⚠️ Pas de contrainte unique sur n_quit : "ON CONFLICT DO NOTHING" ici ne
-- protège de rien (pas de cible de conflit). Un DELETE préalable évite les
-- doublons si tu relances ce script plusieurs fois.
DELETE FROM paiement WHERE n_quit LIKE 'TEST-QUIT-%';

INSERT INTO paiement (id_contribuable_id,central_recette_id,mode_paiement_id,n_quit,montant,date_paiement) VALUES
(1,1,1,'TEST-QUIT-001',105000,'2026-09-02'),
(1,2,2,'TEST-QUIT-002',110000,'2026-09-03'),
(2,3,1,'TEST-QUIT-003',115000,'2026-09-04'),
(2,4,2,'TEST-QUIT-004',120000,'2026-09-05'),
(3,5,1,'TEST-QUIT-005',125000,'2026-09-06'),
(3,6,2,'TEST-QUIT-006',130000,'2026-09-07'),
(4,7,1,'TEST-QUIT-007',135000,'2026-09-08'),
(4,8,2,'TEST-QUIT-008',140000,'2026-09-09'),
(5,9,1,'TEST-QUIT-009',145000,'2026-09-10'),
(5,10,2,'TEST-QUIT-010',150000,'2026-09-11'),
(6,11,1,'TEST-QUIT-011',155000,'2026-09-12'),
(6,12,2,'TEST-QUIT-012',160000,'2026-09-13'),
(7,13,1,'TEST-QUIT-013',165000,'2026-09-14'),
(7,14,2,'TEST-QUIT-014',170000,'2026-09-15'),
(8,15,1,'TEST-QUIT-015',175000,'2026-09-16'),
(8,16,2,'TEST-QUIT-016',180000,'2026-09-17'),
(9,17,1,'TEST-QUIT-017',185000,'2026-09-18'),
(9,18,2,'TEST-QUIT-018',190000,'2026-09-19'),
(10,19,1,'TEST-QUIT-019',195000,'2026-09-20'),
(10,20,2,'TEST-QUIT-020',200000,'2026-09-21');

-- Séquences Django/PostgreSQL
SELECT setval(pg_get_serial_sequence('contribuable','id_contribuable'),COALESCE((SELECT MAX(id_contribuable) FROM contribuable),1),true);
SELECT setval(pg_get_serial_sequence('operateur','id'),COALESCE((SELECT MAX(id) FROM operateur),1),true);
SELECT setval(pg_get_serial_sequence('central_recette','id_transaction'),COALESCE((SELECT MAX(id_transaction) FROM central_recette),1),true);
SELECT setval(pg_get_serial_sequence('logiciel','id'),COALESCE((SELECT MAX(id) FROM logiciel),1),true);
SELECT setval(pg_get_serial_sequence('mode_paiement','id'),COALESCE((SELECT MAX(id) FROM mode_paiement),1),true);
SELECT setval(pg_get_serial_sequence('num_impot','id'),COALESCE((SELECT MAX(id) FROM num_impot),1),true);
SELECT setval(pg_get_serial_sequence('civisme_fiscale','id'),COALESCE((SELECT MAX(id) FROM civisme_fiscale),1),true);

COMMIT;

-- Vérification
SELECT 'operateur' AS table_name,COUNT(*) AS total FROM operateur WHERE propr_cin LIKE '1010000000%'
UNION ALL SELECT 'contribuable',COUNT(*) FROM contribuable WHERE propr_cin LIKE '1010000000%'
UNION ALL SELECT 'central_recette',COUNT(*) FROM central_recette WHERE ref_trans LIKE 'TEST-TRANS-%'
UNION ALL SELECT 'paiement',COUNT(*) FROM paiement WHERE n_quit LIKE 'TEST-QUIT-%'
UNION ALL SELECT 'civisme_fiscale',COUNT(*) FROM civisme_fiscale WHERE description LIKE 'TEST -%';

-- ============================================================
-- COMPTES DE TEST (mot de passe RÉELLEMENT utilisable via l'app)
-- ============================================================
-- test01@prenif.mg -> Test@123456
-- test02@prenif.mg -> Test@123456
-- ...
-- test10@prenif.mg -> Test@123456
--
-- CIN opérateurs restants (11 à 20), sans compte contribuable créé :
-- utilisables pour tester l'écran d'inscription.
-- 101000000011 -> Paul Rakotozafy / 0340000011
-- ... jusqu'à 101000000020 -> Mickael Rasoarimalala / 0340000020
-- ============================================================