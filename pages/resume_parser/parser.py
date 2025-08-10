# pyright: reportMissingImports=false
try:
    import streamlit as st  # type: ignore
except ImportError:  # pragma: no cover
    class _StreamlitStub:
        def __getattr__(self, _name):
            raise ImportError("streamlit is required to run this page")

    st = _StreamlitStub()  # type: ignore

st.set_page_config(page_title="Resume Parser", layout="wide")

st.title("🧾 Resume Parser")
st.markdown("---")

uploaded_file = st.file_uploader("Upload a resume (PDF or DOCX)", type=["pdf", "docx"])

if uploaded_file:
    st.info("Parsing coming soon. We'll extract skills, experience, and education.")
    st.write({
        "filename": uploaded_file.name,
        "size_bytes": len(uploaded_file.getvalue()),
        "type": uploaded_file.type,
    })
else:
    st.write("Upload a file to get started.")


