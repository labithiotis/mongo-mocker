#!/usr/bin/env sh

PATH=$PATH:/usr/local/bin:/usr/local/sbin

labort=0;
staged=$(git status --porcelain | grep -v '^[ |??]' | grep '\.js$' | sed -e 's/[A-Z]* *//' | xargs);
if [[ $staged ]]; then
  ./node_modules/eslint/bin/eslint.js --fix -- $staged || labort=1;
  git add $staged;
fi
exit $labort;
