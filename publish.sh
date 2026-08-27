#!/bin/sh
set -e
ng build @swipergy/swipyui
cd dist/swipergy/swipyui
npm publish --access public
