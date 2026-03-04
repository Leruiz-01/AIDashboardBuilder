from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional, Dict, Any
import pandas as pd
import json
import io

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
             
        # Store df in memory using a simple session/file ID
        file_id = "session_df" # Simplified for this single-user prototype
        DATAFRAME_STORAGE[file_id] = df
        
        # Extract data summary
        summary = get_dataframe_summary(df)
        
        # Ask LLM for suggestions
        llm_response_text = generate_chart_suggestions(summary)
        
        try:
             suggestions = json.loads(llm_response_text)
        except json.JSONDecodeError:
             print("LLM returned malformed JSON:", llm_response_text)
             raise HTTPException(status_code=500, detail="Failed to parse analysis results.")
             
        return {"insights": suggestions}
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/chart-data")
async def get_chart_data(params: dict):
    """
    Receives JSON containing chart settings (xAxis, yAxis, chartType, etc).
    Aggregates the dataframe to return the proper chart data series.
    """
    # For prototype we assume a single user and file
    file_id = "session_df"
    
    if file_id not in DATAFRAME_STORAGE:
        raise HTTPException(status_code=400, detail="No session data found. Please upload a file first.")
        
    df = DATAFRAME_STORAGE[file_id]
    
    try:
        x_col = params.get('xAxis')
        y_col = params.get('yAxis')
        aggr = params.get('aggregation', 'sum') # Default aggregation
        limit = params.get('limit', 20)
        
        if not x_col or not y_col:
             raise HTTPException(status_code=400, detail="Missing required parameters: xAxis and yAxis")
             
        if x_col not in df.columns or y_col not in df.columns:
            # If for some reason LLM gets the column name wrong 
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
