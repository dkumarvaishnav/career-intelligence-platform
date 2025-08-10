# pyright: reportMissingImports=false
try:
    import streamlit as st  # type: ignore
except ImportError:  # pragma: no cover
    class _StreamlitStub:
        def __getattr__(self, _name):
            raise ImportError("streamlit is required to run this page")

    st = _StreamlitStub()  # type: ignore

st.set_page_config(page_title="Job Matcher", layout="wide")

st.title("🔍 Job Matcher")
st.markdown("---")

skills = st.text_input("Enter key skills (comma-separated)")
location = st.text_input("Preferred location", "")

if st.button("Find Matches"):
    st.warning("Matching logic is not implemented yet.")
    st.write("Sample results:")
    st.write([
        {"title": "Data Analyst", "company": "Acme Corp", "match": "78%"},
        {"title": "ML Engineer", "company": "Beta Labs", "match": "72%"},
    ])
else:
    st.caption("Provide your skills and location, then click 'Find Matches'.")


