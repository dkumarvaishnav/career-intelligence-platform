# app.py
import streamlit as st
from PIL import Image

st.set_page_config(page_title="Career Intelligence Platform", layout="wide")

st.title("🎓 Career Intelligence Platform")
st.subheader("AI-powered Resume Parsing, Career Recommendations, and Skill Gap Detection")

st.markdown("---")

st.image("https://cdni.iconscout.com/illustration/premium/thumb/career-growth-7065027-5742065.png", use_column_width=True)

if st.button("📊 Go to Dashboard"):
    st.switch_page("src/dashboard/dashboard.py")
