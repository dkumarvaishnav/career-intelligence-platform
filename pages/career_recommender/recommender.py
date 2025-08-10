# pyright: reportMissingImports=false
try:
    import streamlit as st  # type: ignore
except ImportError:  # pragma: no cover
    class _StreamlitStub:
        def __getattr__(self, _name):
            raise ImportError("streamlit is required to run this page")

    st = _StreamlitStub()  # type: ignore

st.set_page_config(page_title="Career Recommender", layout="wide")

st.title("🎯 Career Recommender")
st.markdown("---")

current_role = st.text_input("Current role")
skills = st.text_input("Top skills (comma-separated)")

if st.button("Recommend Careers"):
    st.success("Here are some example recommendations:")
    st.write(["Data Scientist", "ML Engineer", "Business Analyst"])
else:
    st.caption("Enter your current role and skills, then click 'Recommend Careers'.")


