import streamlit as st
from streamlit_extras.switch_page_button import switch_page

st.set_page_config(
    page_title="Career Intelligence Platform",
    page_icon="🎯",
    layout="wide",
)

st.title("Welcome to the Career Intelligence Platform 🎓")
st.markdown("---")

st.markdown("""
This is a prototype platform aimed at:
- Parsing resumes
- Matching suitable jobs
- Recommending career paths
- Identifying skill gaps

Use the button below or the sidebar to explore different features.
""")

# Direct Button to Dashboard
if st.button("Go to Dashboard ➡️"):
    switch_page("dashboard")  # ✅ only the filename without `.py`


st.info("Or use the **sidebar** to explore the platform.")
