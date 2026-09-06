import pandas as pd
import requests


def send_sample_to_endpoint(
    endpoint: str,
    sample: str,
    timeout: int = 3000
):
    payload = {
        "sample": sample
    }
    response = requests.post(
        endpoint,
        json=payload,
        timeout=timeout
    )
    if not response.ok:
        print("Status:", response.status_code)
        print("Response:", response.text)
        print("Payload:", payload)

    response.raise_for_status()
    return response.json()




# default csv params
cleaned = False
separator = ","

# # clean our data
# # I have implemented logic for structural alone
# with open("Parts.csv", "r", encoding="utf-8") as f:

#     # Find the separator using llm with sample data
#     sample = "".join(
#         f.readline()
#         for _ in range(5)
#     )
#     res = send_sample_to_endpoint(
#         endpoint="http://localhost:8000/chat/separator",
#         sample=sample
#     )
#     if res.get("success"):
#         separator = res.get("separator")
#         print(separator)

#     # identify the columns available
#     f.seek(0)
#     columns = []
#     first_line = f.readline().rstrip("\n")
#     columns = first_line.split(separator)

#     col_len = len(columns)
#     # print(f"{'\n'.join(columns)}")
#     print(f"Columns length: {col_len}")


#     # finding problemetic rows
#     f.seek(0)
#     invalid_rows = {}
#     for line_no, line in enumerate(f, 1):
#         fields = line.rstrip("\n").split(separator)

#         if len(fields) != col_len:
#             print(f"Line {line_no}: {len(fields)} fields")
#             invalid_rows[line_no] = line

#     if not invalid_rows:
#         cleaned = True
#     else:
#         # other steps to analyse 
#         pass

# if not cleaned:
#     print("Needs to be cleaned")

separator = ";"
df = pd.read_csv(
    "Parts.csv",
    sep=separator
)

print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

print("\nData types:")
print(df.dtypes)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:", df.duplicated().sum())

print("\nSample:")
print(df.head())

print("\nDescription statistics:")
print(df["DESCRIPTION"].describe())


duplicates = df["DESCRIPTION"].value_counts()
print(duplicates[duplicates > 1])