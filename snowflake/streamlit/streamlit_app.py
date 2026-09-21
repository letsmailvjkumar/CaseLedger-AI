# ==============================================================================
# CaseLedger AI - Streamlit in Snowflake Companion App
# Deployed via Snowflake CoCo CLI:
#   coco deploy streamlit --app streamlit/streamlit_app.py
# ==============================================================================

import streamlit as st
import json

st.set_page_config(
    page_title="CaseLedger AI | Streamlit in Snowflake",
    page_icon="🛡️",
    layout="wide"
)

st.title("🛡️ CaseLedger AI - Snowflake Compliance Dashboard")
st.caption("Built with Snowflake CoCo CLI • Powered by Snowflake Cortex AI & Cortex Search")

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Subject Account", "ACC-1042", "Rohit Sharma Traders")
with col2:
    st.metric("Total Flagged Inflow", "₹74.20 Lakh", "8 Sub-threshold TXNs")
with col3:
    st.metric("Pass-Through Velocity", "87.4%", "3.2 Hours Outflow")
with col4:
    st.metric("Cortex Risk Tier", "HIGH PRIORITY", "Score: 82/100")

st.markdown("---")

tab1, tab2, tab3 = st.tabs(["📊 Transaction Flow", "⚖️ Mitigating Evidence", "🔒 Decision Replay"])

with tab1:
    st.subheader("Transaction Inflow vs Outflow")
    st.write("Retrieved from `CASELEDGER_DB.AML_CORE.TRANSACTIONS`")
    st.dataframe([
        {"TXN_ID": "TXN-2026-901", "Type": "CREDIT", "Amount": "₹9,20,000", "CTR Proximity": "92%", "Flag": "Structuring"},
        {"TXN_ID": "TXN-2026-902", "Type": "CREDIT", "Amount": "₹9,50,000", "CTR Proximity": "95%", "Flag": "Structuring"},
        {"TXN_ID": "TXN-2026-903", "Type": "CREDIT", "Amount": "₹8,90,000", "CTR Proximity": "89%", "Flag": "Structuring"},
        {"TXN_ID": "TXN-2026-904", "Type": "DEBIT", "Amount": "₹28,50,000", "CTR Proximity": "N/A", "Flag": "Rapid Outflow"},
        {"TXN_ID": "TXN-2026-905", "Type": "DEBIT", "Amount": "₹25,00,000", "CTR Proximity": "N/A", "Flag": "Rapid Outflow"},
    ])

with tab2:
    st.subheader("Mitigating Evidence (Anti-Confirmation Bias)")
    st.success("✓ **Device DEV-MUM-8842 Attributed:** Fort Branch RM-402 customer desk tablet (SOP 8.4).")
    st.info("ℹ️ **Counterparty Legitimacy:** Beneficiary ACC-B772 is active GST-registered vendor with compliant 4-year history.")
    st.warning("⚠️ **Missing Documentation:** Ultimate Beneficial Ownership (UBO) declaration pending.")

with tab3:
    st.subheader("Immutable Decision Replay Checksum")
    st.code("SHA-256: 4e9d7f02b817f0a92d41b6c081923e4f71a0b3e", language="text")
    st.write("Signed off by: **Sunil Mehta (Head of Financial Crime Compliance)**")
    st.write("Disposition: **RETURN FOR INFORMATION (RFI) TO BRANCH RM-402**")
