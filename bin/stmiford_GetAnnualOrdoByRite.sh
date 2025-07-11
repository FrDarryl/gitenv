#!/usr/bin/env bash

usage="Usage: $0 Year(YYYY) Rite(NOE|VOE)";

if [ $# -ne 2 ]; then
    echo "${usage}";
    exit 1;
fi;

year="${1}";
rite="${2}";
outfile="${year}_${rite}Ordo.txt";

case $2 in
    NOE)
        curl http://www.universalis.com/europe.england.portsmouth/${year}0101/vcalendar.ics | tac | tac | /bin/grep -E "^SUMMARY" | perl -pe 's/SUMMARY://' | perl -pe 's/,\\n/|/g' | perl -pe 's/ or //g' | /bin/sed -E "s/^/${rite}\t/" >| $outfile;
        echo "Wrote ${outfile}";;
    VOE)
        curl http://www.universalis.com/europe.england.ordinariate/${year}0101/vcalendar.ics | tac | tac | /bin/grep -E "^SUMMARY" | perl -pe 's/SUMMARY://' | perl -pe 's/,\\n/|/g' | perl -pe 's/ or //g' | /bin/sed -E "s/^/${rite}\t/" >| $outfile;
        echo "Wrote ${outfile}";;
    VOL)
        echo "Not yet supported";;
    *)
        echo "${usage}";;
esac

