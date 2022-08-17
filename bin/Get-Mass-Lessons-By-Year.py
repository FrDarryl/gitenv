from pyquery import PyQuery as pq
from lxml import etree
import urllib
import sys
from datetime import date, timedelta

def allDays(year):
   d = date(year, 1, 1)                    # January 1st
   while d.year == year:
      yield d
      d += timedelta(days = 1)

def allDaysOfWeek(year,dow):
   d = date(year, 1, 1)                    # January 1st
   d += timedelta(days = dow - d.weekday())  # First Sunday
   while d.year == year:
      yield d
      d += timedelta(days = 7)

def getPropersForDate(dateToGet):
    html = pq(url="https://www.ewtn.com/catholicism/daily-readings/" + dateToGet)

    print(html(".readings__title").text())

    for element in html(".readings__group").items():
        print(element(".readings__reference").text())
        print(element(".readings__passage").text())

userYearInt = int(sys.argv[1])
if len(sys.argv) > 2:
    dow = int(sys.argv[2])
    for dateObj in allDaysOfWeek(userYearInt,dow):
        dateStr = str(dateObj)
        print("Date: " + dateStr)
        getPropersForDate(dateStr)

else:
    for dateObj in allDays(userYearInt):
        dateStr = str(dateObj)
        print("Date: " + dateStr)
        getPropersForDate(dateStr)

    
