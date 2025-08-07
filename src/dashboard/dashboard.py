# src/dashboard/dashboard.py
import streamlit as st

st.set_page_config(page_title="Dashboard", layout="wide")

st.sidebar.title("Navigation")
st.sidebar.success("← Back to Homepage")

st.title("📊 Dashboard")
st.markdown("### What this app will do:")

col1, col2, col3 = st.columns(3)

with col1:
    st.subheader("📄 Resume Parsing")
    st.write("• Extract structured data\n• Identify skills, experience\n• Support PDFs or raw text")

with col2:
    st.subheader("🎯 Career Recommender")
    st.write("• Recommend roles\n• Match job market demand\n• Based on resume content")

with col3:
    st.subheader("🧩 Skill Gap Analysis")
    st.write("• Identify missing skills\n• Visualize gaps\n• Suggest learning paths")
