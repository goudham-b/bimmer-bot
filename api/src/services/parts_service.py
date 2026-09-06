from pathlib import Path
import pandas as pd
from services.llm_service import LLMService


class PartsService:

    def __init__(
        self,
        llm_service: LLMService
    ):
        base_dir = Path(__file__).resolve().parent.parent
        self.file_path = base_dir / "datasets" / "Parts.csv"
        self.llm_service = llm_service

    def get_sample(self, number_of_lines: int = 5) -> str:
        """
        Read the first N lines from the CSV.
        """
        with self.file_path.open(
            "r",
            encoding="utf-8"
        ) as f:
            return "".join(
                f.readline()
                for _ in range(number_of_lines)
            )

    def find_separator(self) -> str:
        """
        Detect the CSV separator using the LLM service.
        """
        sample = self.get_sample()

        separator = self.llm_service.find_separator(
            sample
        )

        return separator.strip()

    def get_columns(self, separator: str) -> list[str]:
        """
        Read the first line and return column names.
        """
        with self.file_path.open(
            "r",
            encoding="utf-8"
        ) as f:
            first_line = f.readline().rstrip("\n")

        return first_line.split(separator)

    def validate_structure(
        self,
        separator: str
    ) -> dict:
        """
        Check whether every row has the same
        number of fields as the header.
        """
        columns = self.get_columns(separator)
        column_count = len(columns)

        invalid_rows = {}

        with self.file_path.open(
            "r",
            encoding="utf-8"
        ) as f:

            for line_no, line in enumerate(f, 1):

                fields = line.rstrip("\n").split(separator)

                if len(fields) != column_count:
                    invalid_rows[line_no] = {
                        "field_count": len(fields),
                        "line": line.rstrip("\n")
                    }

        return {
            "valid": len(invalid_rows) == 0,
            "column_count": column_count,
            "columns": columns,
            "invalid_rows": invalid_rows
        }

    def load_dataframe(
        self,
        separator: str
    ) -> pd.DataFrame:
        """
        Load CSV into pandas.
        """
        return pd.read_csv(
            self.file_path,
            sep=separator
        )

    def get_statistics(
        self,
        df: pd.DataFrame
    ) -> str:
        """
        Generate human-readable descriptive statistics.
        """

        lines = []

        rows, columns = df.shape

        lines.append("Dataset Statistics")
        lines.append(f"Rows: {rows}")
        lines.append(f"Columns: {columns}")

        lines.append("\nColumns:")
        for column in df.columns:
            lines.append(f"- {column}")

        lines.append("\nData Types:")
        for column, dtype in df.dtypes.items():
            lines.append(f"- {column}: {dtype}")

        lines.append("\nMissing Values:")
        for column, count in df.isnull().sum().items():
            lines.append(f"- {column}: {count}")

        lines.append(
            f"\nDuplicate Rows: {df.duplicated().sum()}"
        )

        if "DESCRIPTION" in df.columns:

            description = df["DESCRIPTION"]
            counts = description.value_counts()

            lines.append("\nDescription Statistics")
            lines.append(
                f"Count: {description.count()}"
            )
            lines.append(
                f"Unique: {description.nunique()}"
            )

            if not description.mode().empty:
                lines.append(
                    f"Most Common: {description.mode().iloc[0]}"
                )

            if not counts.empty:
                lines.append(
                    f"Most Common Frequency: {counts.iloc[0]}"
                )

        return "\n".join(lines)


    def analyse(self) -> dict:

        print("1. Finding separator")
        separator = self.find_separator()

        print("2. Separator:", separator)
        validation = self.validate_structure(separator)

        print("3. Validation completed")
        result = {
            "file": str(self.file_path),
            "separator": separator,
            "validation": validation
        }

        if validation["valid"]:
            print("4. Loading dataframe")
            df = self.load_dataframe(separator)

            print("5. Generating statistics")
            result["statistics"] = self.get_statistics(df)

        return result["statistics"]
