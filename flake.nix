{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = with pkgs;
          mkShell {
            name = "Default developpement shell";
            packages = [
              cocogitto
              nixpkgs-fmt
              nodePackages.markdownlint-cli
              pre-commit

              just
              bkt

              deno
              lcov

              sqlite
            ];
            shellHook = ''
              export PROJ="cfwf"

              echo ""
              echo "⭐ Welcome to the $PROJ project ⭐"
              echo ""
              just
              echo ""
            '';
          };
      });
}
