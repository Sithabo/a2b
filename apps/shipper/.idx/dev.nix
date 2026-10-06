# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # Configure the "web" preview
        web = {
          # The user requested to listen on port 8081.
          # We run the "web" script which is configured to use --port 8081.
          command = ["npm" "run" "web"];
          manager = "web";
          env = {
            # Optional: Start on 8081 if strictly required by environment
            PORT = "8081";
          };
        };
      };
    };
  };
}
