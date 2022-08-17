import csv
import json
import sys

#Read CSV File
def read_CSV(csv_file_path, json_file_path):
    csv_data = []
    with open(csv_file_path) as csvFile:
        reader = csv.DictReader(csvFile)
        field = reader.fieldnames
        for row in reader:
            csv_data.extend([{field[i]:row[field[i]] for i in range(len(field))}])
        convert_write_json(csv_data, json_file_path)

#Convert csv data into json
def convert_write_json(csv_data, json_file_path):
    with open(json_file_path, "w") as f:
        f.write(json.dumps(csv_data, sort_keys=False, indent=4, separators=(',', ': '))) #for pretty
        f.write(json.dumps(csv_data))

read_CSV(sys.argv[1],sys.argv[2])
