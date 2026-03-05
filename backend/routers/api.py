from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional, Dict, Any
import pandas as pd
import json
import io
import re
import base64

from services.data_service import get_dataframe_summary
from services.llm_service import generate_chart_suggestions

router = APIRouter()

# In-memory store for the uploaded DataFrames (for prototyping purposes)
# In production, you would save this to a database, S3, or temporal file
DATAFRAME_STORAGE: Dict[str, pd.DataFrame] = {}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")
    
    try:
        contents = await file.read()
        
        # Determine how to read the file
        if file.filename.endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except Exception as e:
                # Try reading with different encodings or separators if first attempt fails
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1', sep=None, engine='python')
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Basic validation: Check if file is too big or empty
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
            
        if len(df) > 50000:
             # Just a safety limit for memory in this prototype
             df = df.head(50000)
             
        # Strict Analysis Validations
        if df.shape[1] < 2:
            raise HTTPException(
                status_code=400, 
                detail="Invalid dataset: A valid dashboard requires at least 2 columns to create charts."
            )
            
        numeric_cols = df.select_dtypes(include=['number', 'float', 'int']).columns
        if len(numeric_cols) == 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset: No numerical data found. At least one column must contain numbers to generate charts."
            )
             
        # Store df in memory using a simple session/file ID
        file_id = "session_df" # Simplified for this single-user prototype
        DATAFRAME_STORAGE[file_id] = df
        
        # Wide-format detection & melting
        # If the dataset has many numeric columns (like User x Artist play counts),
        # melt it into long format so the LLM sees "Category" and "Value" columns
        # instead of hallucinating non-existent column names.
        text_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
        num_cols_list = df.select_dtypes(include=['number']).columns.tolist()
        
        analysis_df = df  # Default: use original
        
        if len(num_cols_list) >= 5 and len(text_cols) <= 1:
            # This looks like a wide-format matrix (e.g., User x Artist)
            # Identify the ID column (first text column or first column)
            id_col = text_cols[0] if text_cols else df.columns[0]
            value_cols = [c for c in num_cols_list if c != id_col]
            
            if len(value_cols) >= 5:
                melted = df.melt(
                    id_vars=[id_col],
                    value_vars=value_cols,
                    var_name="Category",
                    value_name="Value"
                )
                melted = melted.dropna(subset=["Value"])
                analysis_df = melted
                # Also store the melted version for chart data aggregation
                DATAFRAME_STORAGE[file_id] = melted
                print(f"Wide-format detected: melted {len(value_cols)} columns into Category/Value. Shape: {melted.shape}")
        
        # Extract data summary
        summary = get_dataframe_summary(analysis_df)
        
        # Ask LLM for suggestions
        llm_response_text = generate_chart_suggestions(summary)
        
        # Strip markdown formatting if present
        cleaned_text = re.sub(r'```json\s*', '', llm_response_text)
        cleaned_text = re.sub(r'```\s*', '', cleaned_text)
        cleaned_text = cleaned_text.strip()
        
        try:
             suggestions = json.loads(cleaned_text)
             
             # Defensive checking: LLM might return a dictionary containing a list instead of a direct array
             if not isinstance(suggestions, list):
                 if isinstance(suggestions, dict) and 'insights' in suggestions:
                     suggestions = suggestions['insights']
                 else:
                     suggestions = []
                     
             # Calculate the real chart data for each suggestion immediately
             for insight in suggestions:
                 try:
                     params = insight.get("parameters", {})
                     x_col = str(params.get('xAxis', '')).strip()
                     y_col = str(params.get('yAxis', '')).strip()
                     aggr = params.get('aggregation', 'sum')
                     limit = params.get('limit', 20)
                     
                     chart_data = []
                     if x_col and y_col:
                         # Case-insensitive match if AI got casing wrong
                         for col in df.columns:
                             if col.lower() == x_col.lower(): x_col = col
                             if col.lower() == y_col.lower(): y_col = col

                         if x_col in df.columns and y_col in df.columns:
                             plot_df = df.dropna(subset=[x_col, y_col])
                             if aggr in ['sum', 'mean']:
                                 plot_df[y_col] = pd.to_numeric(plot_df[y_col], errors='coerce')
                                 plot_df = plot_df.dropna(subset=[y_col])
                             
                             if not plot_df.empty:
                                 if aggr == 'sum':
                                     grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
                                 elif aggr == 'mean':
                                     grouped = plot_df.groupby(x_col)[y_col].mean().reset_index()
                                 elif aggr == 'count':
                                     grouped = plot_df.groupby(x_col)[y_col].count().reset_index()
                                 else:
                                     grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
                                 
                                 grouped = grouped.sort_values(by=y_col, ascending=False).head(limit)
                                 
                                 for _, row in grouped.iterrows():
                                     chart_data.append({
                                         "name": str(row[x_col]),
                                         "value": row[y_col]
                                     })
                     insight["data"] = chart_data
                 except Exception as e:
                     print(f"Error calculating data for insight {insight.get('id')}: {e}")
                     insight["data"] = []
                 
        except json.JSONDecodeError:
             print("LLM returned malformed JSON:", llm_response_text)
             raise HTTPException(status_code=500, detail="Failed to parse analysis results.")
             
        return {"insights": suggestions}
        
    except HTTPException as he:
        # Pass through the intentional validation HTTP 400 errors
        raise he
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/chart-data")
async def get_chart_data(params: dict):
    """
    Receives JSON containing chart settings (xAxis, yAxis, chartType, etc).
    Aggregates the dataframe to return the proper chart data series.
    """
    # For production stateless (Render), we receive the file data directly in the params
    file_data_url = params.get('fileDataUrl')
    
    if file_data_url:
        try:
            # Format is usually 'data:text/csv;base64,.....'
            if ',' in file_data_url:
                base64_data = file_data_url.split(',')[1]
            else:
                base64_data = file_data_url
                
            # Ensure correct padding for base64
            base64_data = str(base64_data).strip()
            # Strip out any non-ascii characters that might have been injected
            base64_data = re.sub(r'[^\x00-\x7F]+', '', base64_data)
            # Handle potential url-encoding or incorrect padding from JS
            base64_data = base64_data.replace('-', '+').replace('_', '/')
            padding_needed = len(base64_data) % 4
            if padding_needed:
                base64_data += '=' * (4 - padding_needed)
                
            decoded_bytes = base64.b64decode(base64_data, validate=False)
            
            # Try parsing as CSV first, fallback to Excel
            try:
                df = pd.read_csv(io.BytesIO(decoded_bytes))
            except Exception:
                try:
                    df = pd.read_csv(io.BytesIO(decoded_bytes), encoding='latin1', sep=None, engine='python')
                except Exception:
                     df = pd.read_excel(io.BytesIO(decoded_bytes))
                     
            # Clean headers to prevent mismatches
            df.columns = df.columns.astype(str).str.strip()
        except Exception as e:
            print(f"Error decoding base64 file data: {str(e)}")
            raise HTTPException(status_code=400, detail="Could not parse the provided file data.")
    else:
        # Fallback to prototyping memory (works locally, but fails on Render if worker restarts)
        file_id = "session_df"
        if file_id not in DATAFRAME_STORAGE:
            raise HTTPException(status_code=400, detail="No session data found and no file data provided.")
        df = DATAFRAME_STORAGE[file_id]
    
    try:
        x_col = str(params.get('xAxis', '')).strip()
        y_col = str(params.get('yAxis', '')).strip()
        aggr = params.get('aggregation', 'sum') # Default aggregation
        limit = params.get('limit', 20)
        
        if not x_col or not y_col:
             raise HTTPException(status_code=400, detail="Missing required parameters: xAxis and yAxis")
             
        if x_col not in df.columns or y_col not in df.columns:
            # Attempt case-insensitive match
            for col in df.columns:
                if col.lower() == x_col.lower(): x_col = col
                if col.lower() == y_col.lower(): y_col = col
                
            if x_col not in df.columns or y_col not in df.columns:
                 print(f"Data Mismatch - Requested: {x_col}, {y_col}. Available: {df.columns.tolist()}")
                 return {"data": []}
            
        # Clean data: drop NAs in those specific columns
        plot_df = df.dropna(subset=[x_col, y_col])
        
        # Ensure y_col is numeric to aggregate
        plot_df[y_col] = pd.to_numeric(plot_df[y_col], errors='coerce')
        plot_df = plot_df.dropna(subset=[y_col])
        
        # Group by x_col and aggregate y_col
        if aggr == 'sum':
             grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
        elif aggr == 'mean':
             grouped = plot_df.groupby(x_col)[y_col].mean().reset_index()
        elif aggr == 'count':
             grouped = plot_df.groupby(x_col)[y_col].count().reset_index()
        else:
             grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
             
        # Sort and limit for charts
        grouped = grouped.sort_values(by=y_col, ascending=False).head(limit)
        
        # Format for Recharts
        # Example format needed: [{ "name": "Category A", "value": 400 }, ...]
        chart_data = []
        for index, row in grouped.iterrows():
             chart_data.append({
                 "name": str(row[x_col]),
                 "value": row[y_col]
             })
             
        return {"data": chart_data}
        
    except Exception as e:
        print(f"Error generating chart data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating chart data: {str(e)}")
