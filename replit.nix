{ pkgs }: {
  deps = [
    pkgs.sqlite-interactive
    pkgs.postgresql_13
    pkgs.cowsay
  ];
}