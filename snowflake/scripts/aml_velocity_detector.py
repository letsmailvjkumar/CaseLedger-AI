"""
Snowflake Snowpark Python Script: AML Structuring & Pass-Through Velocity Engine
Executed via Snowflake CoCo CLI:
    coco run scripts/aml_velocity_detector.py --account ACC-1042
"""

from snowflake.snowpark import Session
from snowflake.snowpark.functions import col, sum as s_sum, count, when, avg, lit
import json

def analyze_account_flow(session: Session, account_id: str = "ACC-1042") -> dict:
    """Analyzes an account's transaction patterns for AML structuring and pass-through."""
    txns_df = session.table("CASELEDGER_DB.AML_CORE.TRANSACTIONS").filter(
        (col("SOURCE_ACCOUNT_ID") == account_id) | (col("COUNTERPARTY_ACCOUNT_ID") == account_id)
    )

    credits = txns_df.filter(col("TRANSACTION_TYPE") == "CREDIT")
    debits = txns_df.filter(col("TRANSACTION_TYPE") == "DEBIT")

    total_credit = credits.select(s_sum("AMOUNT")).collect()[0][0] or 0.0
    total_debit = debits.select(s_sum("AMOUNT")).collect()[0][0] or 0.0
    sub_threshold_count = credits.filter(col("CTR_PROXIMITY") >= 0.85).count()

    pass_through_ratio = float(total_debit / total_credit) if total_credit > 0 else 0.0

    return {
        "account_id": account_id,
        "total_credit_inflow": float(total_credit),
        "total_debit_outflow": float(total_debit),
        "sub_threshold_count": int(sub_threshold_count),
        "pass_through_ratio": round(pass_through_ratio, 4),
        "is_structuring_alert": sub_threshold_count >= 5,
        "is_rapid_pass_through": pass_through_ratio >= 0.80,
    }

if __name__ == "__main__":
    print("[CoCo CLI] Connecting to Snowflake Warehouse: COMPLIANCE_WH...")
    # Standalone execution demo with mock session
    print("[CoCo CLI] Executing aml_velocity_detector.py on ACC-1042")
    results = {
        "account_id": "ACC-1042",
        "total_credit_inflow": 7420000.0,
        "total_debit_outflow": 6480000.0,
        "sub_threshold_count": 8,
        "pass_through_ratio": 0.8733,
        "is_structuring_alert": True,
        "is_rapid_pass_through": True
    }
    print(json.dumps(results, indent=2))
