-- =========================================================================
-- Vues SQL utilisées par l'application (modèles Django en managed = False)
--
-- À exécuter APRÈS `python manage.py migrate` (les vues lisent les tables
-- créées par Django).
--
--   psql -U postgres -d nif -f sql/vues.sql
--   (ou : pgAdmin 4 → Query Tool → coller le contenu → Exécuter)
--
-- ⚠️ Ces vues sont une RECONSTRUCTION à partir des modèles Django : les
-- définitions d'origine ont été perdues. Les choix de logique sont indiqués
-- en commentaire ; ils sont faciles à modifier.
--
-- Chaque vue expose une colonne "id" : Django en suppose une (clé primaire
-- implicite) sur les modèles qui n'en déclarent pas.
-- =========================================================================


-- -------------------------------------------------------------------------
-- 1) Messages avec l'identité du contribuable (écran administrateur)
--    Modèle : MessagesAdmin
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_messages AS
SELECT
    m.id                   AS id,
    c.id_contribuable      AS contribuable,
    c.photo                AS photo,
    c.propr_prenif         AS propr_prenif,
    c.propr_name           AS propr_name,
    c.last_name            AS last_name,
    m.question             AS questions,
    m.reponse              AS reponses,
    m.date_reponse::date   AS date_reponse,
    m.date_question::date  AS date_question
FROM messages m
JOIN contribuable c ON c.propr_prenif = m.prenif;


-- -------------------------------------------------------------------------
-- 2) Total versé par contribuable et par année (histogramme du tableau de bord)
--    Modèle : VueSommeParContribuableParAnnee
--
--    Choix : l'année est celle de la DATE DE PAIEMENT.
--    Pour utiliser l'année de recouvrement, remplacer p.date_paiement par
--    cr.annee_recouvrement (et ajouter la jointure sur central_recette).
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_somme_par_contribuable_par_annee AS
SELECT
    ROW_NUMBER() OVER (
        ORDER BY p.id_contribuable_id, EXTRACT(YEAR FROM p.date_paiement)
    )::integer                                     AS id,
    p.id_contribuable_id                           AS contribuable,
    EXTRACT(YEAR FROM p.date_paiement)::integer    AS annee,
    ROUND(SUM(p.montant)::numeric, 2)              AS total_mnt_ver
FROM paiement p
GROUP BY p.id_contribuable_id, EXTRACT(YEAR FROM p.date_paiement);


-- -------------------------------------------------------------------------
-- 3) Détail des transactions (historique)
--    Modèle : TransactionView
--
--    Choix : UNE LIGNE PAR PAIEMENT (donc par numéro de quittance), sans
--    regroupement. Les inner joins excluent un paiement dont l'impôt, le
--    mode de paiement ou le logiciel serait absent.
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW vue_detail_transactions_par_quit_et_contribuable AS
SELECT
    p.id                                            AS id,
    p.id_contribuable_id                            AS contribuable,
    p.n_quit                                        AS n_quit,
    p.date_paiement                                 AS date_paiement,
    EXTRACT(YEAR FROM p.date_paiement)::integer     AS annee_de_paiement,
    cr.annee_recouvrement                           AS annee_recouvrement,
    cr.date_debut                                   AS date_debut,
    cr.date_fin                                     AS date_fin,
    ROUND(cr.base::numeric, 2)                      AS base,
    ROUND(cr.mnt_ap::numeric, 2)                    AS mnt_ap,
    cr.nimp_id                                      AS nimp,
    COALESCE(cr.imp_detail, '')                     AS imp_detail,
    ni.numero::varchar(50)                          AS numero,
    ni.impot                                        AS impot,
    mp.sens                                         AS sens,
    l.logiciel                                      AS logiciel,
    ROUND(p.montant::numeric, 2)                    AS montant
FROM paiement p
JOIN central_recette cr ON cr.id_transaction = p.central_recette_id
JOIN num_impot       ni ON ni.id             = cr.nimp_id
JOIN mode_paiement   mp ON mp.id             = p.mode_paiement_id
JOIN logiciel         l ON l.id              = cr.logiciel_id;
