#!/bin/env bash

cd /home/${USER}

gitenvDir="/home/${USER}/GitRepos/gitenv"
if [[ ! -d "${gitenvDir}" ]];then
    mkdir -p "$gitenvDir"
    cd /home/${USER}/GitRepos
    git clone https://github.com/FrDarryl/gitenv.git
    cd /home/${USER}
fi

for gitenvDotfile in ${gitenvDir}/dotfiles/.*;
do
    echo "Found ${gitenvDotfile}"
    dotfileBasename="$(basename ${gitenvDotfile})"
    if [ ${dotfileBasename} = "." ] || [ ${dotfileBasename} = ".." ]; then
       continue
    fi
    if [ -L ${dotfileBasename} ]; then
        echo "..Deleting existing symlink ${PWD}/${dotfileBasename}"
        rm ${dotfileBasename}
    elif [ -f ${dotfileBasename} ]; then
        echo "..Renaming existing ${PWD}/${dotfileBasename} to ${PWD}/${dotfileBasename}.factory"
        mv ${dotfileBasename} ${dotfileBasename}.factory
    fi
    echo "..Creating ${PWD}/${dotfileBasename} (symbolic link to ${gitenvDotfile})"
    ln -s ${gitenvDotfile} ./${dotfileBasename}
done

. /home/${USER}/.bashrc
