#!/usr/bin/env bash
input=$(cat)
cwd=$(echo "$input" | jq -r '.cwd // .workspace.current_dir // ""')
model=$(echo "$input" | jq -r '.model.display_name // ""')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

dir=$(basename "$cwd")

if [ -n "$used" ]; then
  ctx_info=" | ctx: ${used}%"
else
  ctx_info=""
fi

printf "\033[36m%s\033[0m \033[33m[%s]\033[0m\033[90m%s\033[0m" "$dir" "$model" "$ctx_info"
