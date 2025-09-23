from pyquery import PyQuery as pq
from lxml import etree
import urllib

d13 = pq(url="https://www.winchester.anglican.org/acny/deanery/13/")

for p13 in d13(".sq5").items():
    print(p13("h2").text())

