# CaseLedger AI — Built with Snowflake CoCo CLI (Cortex Code)
**Hackathon Submission: CoCo CLI Hack GCC Edition**

CaseLedger AI was engineered from the ground up using the **Snowflake CoCo CLI** development workflow taught in **Workshop 1** and **Workshop 2**:

---

## 🛠️ Workshop 1: Getting Started with Snowflake CoCo CLI
In accordance with Workshop 1, we initialized our enterprise compliance workspace with Snowflake CoCo CLI:

1. **Environment Setup & Initialization**:
   ```bash
   coco init --template enterprise-ai-agent
   coco config set snowflake.warehouse COMPLIANCE_WH
   coco config set snowflake.database CASELEDGER_DB
   coco config set snowflake.schema AML_CORE
   ```

2. **Schema & DDL Deployment**:
   ```bash
   coco sql --file ddl/01_aml_schema.sql
   ```
   Deployed `ACCOUNTS`, `TRANSACTIONS`, `EVIDENCE_RECORDS`, `REGULATORY_POLICY_CORPUS`, and tamper-evident `DECISION_REPLAY_SNAPSHOTS` on Snowflake.

3. **Data Verification**:
   ```bash
   coco sql --run "SELECT COUNT(*) FROM CASELEDGER_DB.AML_CORE.TRANSACTIONS;"
   ```

---

## 🧠 Workshop 2: Building AI Applications with Snowflake CoCo CLI
In accordance with Workshop 2, we built governed AI agents and services using Cortex AI:

1. **Cortex Search Service Creation**:
   ```bash
   coco cortex search create --file cortex/search_service.sql
   ```
   Indexes FIU-IND and RBI Master Directions for low-latency semantic retrieval by the compliance agent.

2. **Cortex Analyst Semantic Model**:
   Defined `cortex/semantic_model.yaml` mapping business metrics (Pass-Through Outflow Ratio, CTR Proximity, Sub-Threshold Structuring counts) to Snowflake queries:
   ```bash
   coco cortex analyst "What accounts have rapid pass-through > 80%?"
   ```

3. **Autonomous Agent Execution**:
   ```bash
   coco agent "Analyze account ACC-1042 for structuring and branch device linkage"
   ```

4. **Streamlit in Snowflake Deployment**:
   ```bash
   coco deploy streamlit --app streamlit/streamlit_app.py
   ```

5. **Decision Replay Checksum Generation**:
   Produces SHA-256 frozen snapshots stored in Snowflake `DECISION_REPLAY_SNAPSHOTS` for audit-ready defensibility.
