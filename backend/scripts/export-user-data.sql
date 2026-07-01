-- =============================================================================
-- MeraDhan: export one customer's data as INSERT statements (PostgreSQL)
-- =============================================================================
--
-- Option A (recommended): use the Bun exporter (handles JSON, arrays, FK order)
--
--   cd backend
--   bun run scripts/export-user-data.ts <customerProfileId|userName> [output.sql]
--
--   Examples:
--     bun run scripts/export-user-data.ts 42
--     bun run scripts/export-user-data.ts UCC12345 ./exports/ucc12345.sql
--
-- Option B: run this file in psql on the SOURCE database after setting the id
--
--   psql "$DATABASE_URL" -v customer_profile_id=42 -f scripts/export-user-data.sql \
--     -o user_42_export.sql
--
-- Then import on the TARGET database:
--
--   psql "$TARGET_DATABASE_URL" -f user_42_export.sql
--
-- Notes:
-- - customer_profile_id = customers_profile_data.id (not customers_auth_data.id)
-- - Parent CRM rows (crm_users, notification_templates, saved lists) are NOT
--   exported; only rows directly tied to the customer are included.
-- - Uses ON CONFLICT DO NOTHING so re-import is safe if ids already exist.
-- =============================================================================

\if :{?customer_profile_id}
\else
\echo 'ERROR: pass -v customer_profile_id=<id> (customers_profile_data.id)'
\quit
\endif

\set ON_ERROR_STOP on
\timing off
\o /dev/stdout

SELECT format($hdr$
-- MeraDhan customer export (psql)
-- customer_profile_id: %s
-- generatedAt: %s

BEGIN;
SET session_replication_role = replica;

$hdr$, :'customer_profile_id', now()::text);

-- Helper: emit INSERT ... ON CONFLICT DO NOTHING for any public table + WHERE clause
CREATE OR REPLACE FUNCTION pg_temp.export_inserts(
    p_table regclass,
    p_where text DEFAULT 'TRUE'
) RETURNS SETOF text
LANGUAGE plpgsql AS $$
DECLARE
    r record;
    col_list text;
    val_list text;
    sql text;
BEGIN
    FOR r IN EXECUTE format('SELECT * FROM %s WHERE %s', p_table, p_where) LOOP
        SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum),
               string_agg(
                   CASE
                       WHEN v IS NULL THEN 'NULL'
                       WHEN pg_typeof(v)::text = 'jsonb' THEN quote_literal(v::text) || '::jsonb'
                       WHEN pg_typeof(v)::text = 'json' THEN quote_literal(v::text) || '::json'
                       WHEN pg_typeof(v)::text LIKE '%[]' THEN quote_literal(v::text) || '::' || pg_typeof(v)::text
                       ELSE quote_literal(v::text)
                   END,
                   ', ' ORDER BY a.attnum
               )
        INTO col_list, val_list
        FROM pg_attribute a
        CROSS JOIN LATERAL (SELECT (to_jsonb(r) ->> a.attname)::text AS v) x
        WHERE a.attrelid = p_table
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND (to_jsonb(r) ? a.attname);

        sql := format(
            'INSERT INTO %s (%s) VALUES (%s) ON CONFLICT DO NOTHING;',
            p_table::text,
            col_list,
            val_list
        );
        RETURN NEXT sql;
    END LOOP;
END;
$$;

-- Resolve related ids for this customer
CREATE TEMP TABLE _export_ctx AS
SELECT
    cp.id AS customer_profile_id,
    cp."customersAuthDataModelId" AS auth_id,
    cp."aADHAARCardModelId" AS aadhaar_id,
    cp."panCardModelId" AS pan_id,
    cp."customerPersonalInfoModelId" AS personal_id,
    cp."currentAddressModelId" AS current_address_id,
    cp."permanentAddressModelId" AS permanent_address_id,
    cp."customersRiskProfileModelId" AS risk_id,
    pc."panCardNo" AS pan_no,
    ck.id AS corporate_kyc_id,
    nds."nseCbricsParticipantModelId" AS nse_participant_id
FROM customers_profile_data cp
LEFT JOIN pan_cards pc ON pc.id = cp."panCardModelId"
LEFT JOIN corporate_kyc ck ON ck."customerProfileDataModelId" = cp.id
LEFT JOIN nse_customer_data_set nds ON nds."customerProfileDataModelId" = cp.id
WHERE cp.id = :customer_profile_id::int;

SELECT count(*) AS export_ctx_count FROM _export_ctx \gset
\if :export_ctx_count = 0
\echo 'ERROR: no customer found for customer_profile_id'
\quit
\endif

-- Addresses & identity (parents of profile)
SELECT pg_temp.export_inserts('addresses'::regclass, format('id = %s', current_address_id))
FROM _export_ctx WHERE current_address_id IS NOT NULL;
SELECT pg_temp.export_inserts('addresses'::regclass, format('id = %s', permanent_address_id))
FROM _export_ctx WHERE permanent_address_id IS NOT NULL;
SELECT pg_temp.export_inserts('aadhaar_cards'::regclass, format('id = %s', aadhaar_id))
FROM _export_ctx WHERE aadhaar_id IS NOT NULL;
SELECT pg_temp.export_inserts('pan_cards'::regclass, format('id = %s', pan_id))
FROM _export_ctx WHERE pan_id IS NOT NULL;
SELECT pg_temp.export_inserts('customers_personal_info'::regclass, format('id = %s', personal_id))
FROM _export_ctx WHERE personal_id IS NOT NULL;
SELECT pg_temp.export_inserts('customers_risk_profiles'::regclass, format('id = %s', risk_id))
FROM _export_ctx WHERE risk_id IS NOT NULL;
SELECT pg_temp.export_inserts('customers_auth_data'::regclass, format('id = %s', auth_id))
FROM _export_ctx WHERE auth_id IS NOT NULL;

-- Core profile
SELECT pg_temp.export_inserts('customers_profile_data'::regclass, format('id = %s', customer_profile_id))
FROM _export_ctx;

-- Linked accounts
SELECT pg_temp.export_inserts('customers_bank_accounts'::regclass, format('"customerProfileDataModelId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('customers_demat_accounts'::regclass, format('"customerProfileDataModelId" = %s', customer_profile_id)) FROM _export_ctx;

-- Corporate KYC tree
SELECT pg_temp.export_inserts('corporate_kyc'::regclass, format('id = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_attachments'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_bank_accounts'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_demat_accounts'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_directors'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_promoters'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_partners'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_trustees'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_kyc_authorised_signatories'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;
SELECT pg_temp.export_inserts('corporate_e_sign_requests'::regclass, format('"corporateKycModelId" = %s', corporate_kyc_id)) FROM _export_ctx WHERE corporate_kyc_id IS NOT NULL;

-- NSE
SELECT pg_temp.export_inserts('nse_cbrics_unregistered_participant'::regclass, format('id = %s', nse_participant_id)) FROM _export_ctx WHERE nse_participant_id IS NOT NULL;
SELECT pg_temp.export_inserts('nse_cbrics_bank_account'::regclass, format('"nseCbricsParticipantModelId" = %s', nse_participant_id)) FROM _export_ctx WHERE nse_participant_id IS NOT NULL;
SELECT pg_temp.export_inserts('nse_cbrics_dp_account'::regclass, format('"nseCbricsParticipantModelId" = %s', nse_participant_id)) FROM _export_ctx WHERE nse_participant_id IS NOT NULL;
SELECT pg_temp.export_inserts('nse_customer_data_set'::regclass, format('"customerProfileDataModelId" = %s', customer_profile_id)) FROM _export_ctx WHERE nse_participant_id IS NOT NULL;

-- KYC / KRA
SELECT pg_temp.export_inserts('kyc_dump'::regclass, format('"userID" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('kra_data_logs'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('kra_download_response'::regclass, format('app_pan_no = %L', pan_no)) FROM _export_ctx WHERE pan_no IS NOT NULL;

SELECT pg_temp.export_inserts(
    'kra_fatca_addl_dtls'::regclass,
  format('"kraDownloadResponseId" IN (SELECT id FROM kra_download_response WHERE app_pan_no = %L)', pan_no)
) FROM _export_ctx WHERE pan_no IS NOT NULL;

-- Orders
SELECT pg_temp.export_inserts('orders'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('customer_bonds'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('order_logs'::regclass, format('"orderId" IN (SELECT id FROM orders WHERE "customerProfileId" = %s)', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('order_settlement_automation_logs'::regclass, format('"orderId" IN (SELECT id FROM orders WHERE "customerProfileId" = %s)', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('crm_order_receipt_pdf_options'::regclass, format('"orderNumber" IN (SELECT "orderNumber" FROM orders WHERE "customerProfileId" = %s)', customer_profile_id)) FROM _export_ctx;

-- Misc customer-linked rows
SELECT pg_temp.export_inserts('draft_orders'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('"BondsWatchList"'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('"IssueNotesWatchList"'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('storage'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('razorpay_route_stakeholders'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('bond_reminder_logs'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('crm_saved_proposals'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('crm_notification_saved_list_members'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('notification_recipient_logs'::regclass, format('"customerProfileId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('notification_logs'::regclass, format('id IN (SELECT "notificationLogId" FROM notification_recipient_logs WHERE "customerProfileId" = %s)', customer_profile_id)) FROM _export_ctx;

-- Audit / activity
SELECT pg_temp.export_inserts('activity_logs_meradhan'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('login_logs_meradhan'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('session_logs_meradhan'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('page_view_logs_meradhan'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;
SELECT pg_temp.export_inserts('web_audit_logs'::regclass, format('"userId" = %s', customer_profile_id)) FROM _export_ctx;

SELECT $footer$
SET session_replication_role = DEFAULT;
COMMIT;
$footer$;
