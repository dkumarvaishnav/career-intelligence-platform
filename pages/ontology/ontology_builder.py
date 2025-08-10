# pyright: reportMissingImports=false
try:
    import streamlit as st  # type: ignore
except ImportError:  # pragma: no cover
    class _StreamlitStub:
        def __getattr__(self, _name):
            raise ImportError("streamlit is required to run this page")

    st = _StreamlitStub()  # type: ignore

st.set_page_config(page_title="Skill Ontology", layout="wide")

st.title("🧠 Skill Ontology")
st.markdown("---")

st.info("Visualization to be added. We'll build and display a graph of skills using Neo4j/Plotly.")
st.caption("Coming soon.")


