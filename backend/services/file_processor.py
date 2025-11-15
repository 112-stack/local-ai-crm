import os
import csv
import pandas as pd
from typing import List, Dict, Any
from fastapi import UploadFile
import aiofiles

class FileProcessor:
    """Handles file uploads and data extraction"""

    def __init__(self):
        self.upload_dir = 'uploads'
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> str:
        """Save uploaded file to disk"""
        file_path = os.path.join(self.upload_dir, file.filename)

        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        return file_path

    async def process_file(self, file_path: str) -> List[Dict[str, Any]]:
        """Process CSV or Excel file and extract applicant data"""

        if file_path.endswith('.csv'):
            return await self._process_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            return await self._process_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Please upload CSV or Excel file.")

    async def _process_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Process CSV file"""
        applicants = []

        try:
            df = pd.read_csv(file_path)
            applicants = self._extract_applicants_from_dataframe(df)
        except Exception as e:
            raise Exception(f"Error processing CSV: {str(e)}")

        return applicants

    async def _process_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """Process Excel file"""
        applicants = []

        try:
            df = pd.read_excel(file_path)
            applicants = self._extract_applicants_from_dataframe(df)
        except Exception as e:
            raise Exception(f"Error processing Excel: {str(e)}")

        return applicants

    def _extract_applicants_from_dataframe(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Extract applicant data from pandas DataFrame"""
        applicants = []

        # Normalize column names (lowercase, remove spaces)
        df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')

        # Define column mapping (various possible column names)
        column_mapping = {
            'name': ['name', 'applicant_name', 'full_name', 'client_name'],
            'email': ['email', 'email_address', 'contact_email'],
            'phone': ['phone', 'phone_number', 'contact_phone', 'telephone'],
            'company': ['company', 'company_name', 'organization', 'business'],
            'industry': ['industry', 'sector', 'business_type'],
            'revenue': ['revenue', 'annual_revenue', 'yearly_revenue', 'sales'],
            'employees': ['employees', 'employee_count', 'staff', 'headcount'],
            'event_type': ['event_type', 'event', 'type', 'event_category'],
            'budget': ['budget', 'event_budget', 'allocated_budget', 'spend'],
            'date': ['date', 'event_date', 'scheduled_date', 'booking_date']
        }

        # Find actual column names in the dataframe
        actual_columns = {}
        for key, possible_names in column_mapping.items():
            for col in df.columns:
                if col in possible_names:
                    actual_columns[key] = col
                    break

        # Extract data
        for _, row in df.iterrows():
            applicant = {}

            for key, col in actual_columns.items():
                value = row.get(col)
                # Convert to string and handle NaN
                if pd.notna(value):
                    applicant[key] = str(value)

            # Only add if we have at least a name or email
            if applicant.get('name') or applicant.get('email'):
                applicants.append(applicant)

        return applicants

    def _normalize_column_name(self, name: str) -> str:
        """Normalize column name for matching"""
        return name.lower().strip().replace(' ', '_').replace('-', '_')
