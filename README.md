# cfwf

## TODO cfwf project initialisation

Enable **Read and write permissions** on the
[Github action workflow permission](https://github.com/badele/cfwf/settings/actions)
(for pushing the release and changelog)

## Included with this project

- nix/flake - reproducible, declarative and reliable developpement systems
- pre-commit
- cocogitto - conventional commits and auto versioning

## Git workflow

- `nix develop` or automatically loaded with `direnv` tool
- Conventional commits - `cog feat "message" scope`
  - pre-commit hook
    - markdownlint - markdown linter
    - nixpkgs-fmt - nix linter
- github
  - CI
    - conventional commits
    - lint
    - test
    - coverage
  - Manually releasing a new version
    [release action](https://github.com/badele/cfwf/actions/workflows/Release.yml)
