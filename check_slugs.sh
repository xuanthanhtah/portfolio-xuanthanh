#!/bin/bash
slugs=("react" "typescript" "javascript" "nextdotjs" "tailwindcss" "npm" "reactquery" "antdesign" "html5" "css3" "astro" "redux" "microsoftazure" "git" "mui")
for slug in "${slugs[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://cdn.simpleicons.org/$slug/ffffff")
  if [ "$status" != "200" ]; then
    echo "ERROR: $slug returned $status"
  else
    echo "OK: $slug"
  fi
done
