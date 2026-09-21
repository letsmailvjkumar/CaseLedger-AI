-- ==============================================================================
-- Snowflake Cortex Search Service Configuration for CaseLedger AML Policies
-- Command: coco cortex search create --file cortex/search_service.sql
-- ==============================================================================

USE DATABASE CASELEDGER_DB;
USE SCHEMA AML_CORE;

-- Create or replace Cortex Search Service for AML & RBI regulations
CREATE OR REPLACE CORTEX SEARCH SERVICE AML_POLICY_SEARCH_SVC
    ON POLICY_TEXT
    ATTRIBUTES POLICY_NAME, SECTION, REGULATORY_BODY
    WAREHOUSE = COMPLIANCE_WH
    TARGET_LAG = '1 hour'
    AS (
        SELECT 
            POLICY_ID,
            POLICY_NAME,
            SECTION,
            REGULATORY_BODY,
            VERSION,
            POLICY_TEXT,
            RELEVANCE_CRITERIA
        FROM REGULATORY_POLICY_CORPUS
    );

-- Verification Query via Cortex Search
-- SELECT SNOWFLAKE.CORTEX.SEARCH_PREVIEW(
--     'CASELEDGER_DB.AML_CORE.AML_POLICY_SEARCH_SVC',
--     '{
--         "query": "sub-threshold structuring rolling window limits",
--         "columns": ["POLICY_NAME", "SECTION", "POLICY_TEXT"],
--         "limit": 3
--     }'
-- );
