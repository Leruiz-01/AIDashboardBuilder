import pandas as pd
import io

def process_file_to_dataframe(file_content: bytes, filename: str) -> pd.DataFrame:
    """ Reads binary file content into a Pandas DataFrame based on file extension. """
    if filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(file_content))
    elif filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(io.BytesIO(file_content))
    else:
        raise ValueError("Unsupported file format")
    return df

def get_dataframe_summary(df: pd.DataFrame) -> dict:
    """ Extracts schema and basic statistics from the dataframe. """
    # Get column types as strings
    schema = df.dtypes.astype(str).to_dict()
    
    # Get summary statistics for numeric columns
    # We use describe() and convert to dict, replacing NaN with None for JSON serialization
    summary = df.describe(include='all').fillna("").to_dict()
    
    # Also get some sample data (first 3 rows) to help the LLM understand the content
    sample_data = df.head(3).fillna("").to_dict(orient='records')
    
    return {
        "columns": list(df.columns),
        "schema": schema,
        "summary": summary,
        "sample_data": sample_data
    }
