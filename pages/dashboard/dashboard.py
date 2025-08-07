import streamlit as st

st.set_page_config(page_title="Dashboard", layout="wide")

st.title("📊 Dashboard")

st.markdown("---")

# Placeholder stats (can be updated later)
col1, col2, col3 = st.columns(3)
col1.metric("Resumes Parsed", "24")
col2.metric("Jobs Matched", "18")
col3.metric("Career Suggestions", "36")

st.markdown("## Overview")
st.write("This dashboard will provide insights on user progress, job matches, and recommendations in future versions.")

st.success("Demo dashboard loaded successfully!")
