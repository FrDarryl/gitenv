#!/bin/sh
echo 'Interactive Perl shell'
rlwrap -A -pgreen -S"perl> " perl -wnE'say eval()//$@'
