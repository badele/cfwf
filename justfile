#!/usr/bin/env just -f

BROWSER := "chromium"

# This help
@help:
    just -lu --list-heading=$'{{ file_name(justfile()) }} commands:\n'

# Check conventional commits
@conventional-check:
  cog check

# Execute test tasks
@test:
  rm -rf ./.coverage
  deno test --doc --unstable --allow-all --parallel --coverage=./.coverage --trace-ops

# Lint code
@lint:
  deno lint

# Format code
@fmt:
  deno fmt

# Execute coverage
@coverage: test
  deno coverage ./.coverage/ --lcov --output=./.coverage/cov.lcov

# Browse localy coverage
coverage-browse browser="chromium": coverage
  genhtml -o ./.coverage/html_cov ./.coverage/cov.lcov
  {{ browser }} ./.coverage/html_cov/index.html


# Run command interactively, view the result in realtime
@view:
    just --choose --chooser="fzf --margin 0% --reverse --preview-window=right,80% --preview='bkt --ttl=15m --stale=15s -- just {}'"
