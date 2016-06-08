#!/bin/bash

REPOSITORIES=$(cat nubomedia-repositories-fork)
for repo in $REPOSITORIES
do
  echo "Syncing $repo ..."
  reponame=$(echo $repo | cut -d / -f 2)
  repoorg=$(echo $repo | cut -d / -f 1)
  echo "Repo name: $reponame"

  if [ ! -d $reponame.git ]; then
    echo "$reponame not found locally: cloning as mirror"
    git clone --mirror https://github.com/$repoorg/$reponame
    pushd $reponame.git
    git remote set-url --push origin ssh://jenkinskurento@github.com/nubomedia/$reponame
    popd
  fi

  pushd $reponame.git
  echo "Fetching $reponame ..."
  git fetch -p origin
  echo "Pushing $reponame ..."
  git push --mirror
  popd

done
