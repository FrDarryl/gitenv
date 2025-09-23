#!/usr/bin/env python

from pyquery import PyQuery as pq
from lxml import etree
import urllib
import sys
import re
from datetime import datetime, date, timedelta

def showUsage():
    print("format: " + sys.argv[0] + " ButlerLives|NOECalendar|RSVMassReadings|VOECalendar|VOLCalendar [Year(yyyy), default current year] [dow(0-6), default none]")
    sys.exit()

def getVOLCalendarForYear(yearToGet):
    html = pq(url="https://www.propria.org/ordo-" + yearToGet + "/")

    #print(html(".entry-title").text())

    for element in html("tr").items():
        print(element("td").text())

def getVOECalendarForYear(yearToGet):
    html = pq(url="https://www.universalis.com/Europe.England.Ordinariate/calendar.htm?year=" + yearToGet)

    for element in html("tr").items():
        print(element("td").text())

def getButlerLives():
    html = pq(url="https://www.sacred-texts.com/chr/lots/index.htm")
    month = 0
    yesterday = ""
    for element in html("a").items():
        text = element.text()
        z = re.match("^(\d+)\. (.+)",text)
        if z:
            day = z.groups()[0]
            dedication = z.groups()[1]
            if day == yesterday:
                dedication = "(alt) " + dedication
            elif day == "1":
                month += 1

            href = element.attr["href"]
            print(str(month).rjust(2, '0') + "-" + day.rjust(2, '0') + "|" + dedication + "|" + getButlerLife("https://www.sacred-texts.com/chr/lots/" + href))
            yesterday = day

def getButlerLife(url):
    html = pq(url=url)
    text = ""
    p_add_count = 0
    for element in html("p").items():
        p_text = element.text()
        p_text = re.sub("\[paragraph continues\]","",p_text)
        p_text = re.sub("Lives of the Saints.+\.com","",p_text)
        p_text = re.sub("^p\. \d+$","",p_text)
        p_text = re.sub("\s+$","",p_text)
        if len(p_text) > 0:
            text += p_text

    return text

def getNOECalendarForYear(yearToGet):
    html = pq(url="https://www.universalis.com/Europe.England.Portsmouth/calendar.htm?year=" + yearToGet)
    for element in html("tr").items():
        print(element("td").text())

def getRSVMassReadingsForYear(yearToGet, dow):
    year = int(yearToGet)
    if dow != -1:
        for dateObj in allDaysOfWeek(year,dow):
            dateStr = str(dateObj)
            print("Date: " + dateStr)
            getRSVMassReadingsForDate(dateStr)

    else:
        for dateObj in allDays(year):
            dateStr = str(dateObj)
            print("Date: " + dateStr)
            getRSVMassReadingsForDate(dateStr)

def getRSVMassReadingsForDate(dateToGet):
    html = pq(url="https://www.ewtn.com/catholicism/daily-readings/" + dateToGet)

    print(html(".readings__title").text())

    for element in html(".readings__group").items():
        print(element(".readings__reference").text())
        print(element(".readings__passage").text())

def allDays(year):
   d = date(year, 1, 1)                      # January 1st
   while d.year == year:
      yield d
      d += timedelta(days = 1)

def allDaysOfWeek(year,dow):
   d = date(year, 1, 1)                      # January 1st
   d += timedelta(days = dow - d.weekday())  # First specified Day of Week
   while d.year == year:
      yield d
      d += timedelta(days = 7)

if len(sys.argv) == 1:
    showUsage()

whatToGet = sys.argv[1]

if len(sys.argv) == 3:
    yearToGet = sys.argv[2]
else:
    yearToGet = str(datetime.now().year)

if len(sys.argv) == 4:
    dow = int(sys.argv[3])
else:
    dow = -1

if whatToGet == "VOECalendar":
    getVOECalendarForYear(yearToGet)
elif whatToGet == "ButlerLives":
    getButlerLives()
elif whatToGet == "NOECalendar":
    getNOECalendarForYear(yearToGet)
elif whatToGet == "RSVMassReadings":
    getRSVMassReadingsForYear(yearToGet,dow)
elif whatToGet == "VOLCalendar":
    getVOLCalendarForYear(yearToGet)
else:
    showUsage()

