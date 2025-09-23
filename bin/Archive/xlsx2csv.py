import sys
import pandas as pd

data_xls = pd.read_excel(sys.argv[1], sys.argv[2], dtype=str, index_col=None)
data_xls.to_csv(sys.argv[3], encoding='utf-8', index=False)
