SHORT_SHA=$(git rev-parse --short=7 HEAD)
./.deploy/build_deployment.sh \
  STACK="STACK_VALUE" \
  DEPLOYMENT_ENVIROMENT="PROD" \
  IMAGE="ghcr.io/$(echo "ROMANSHKVOLKOV" | tr '[:upper:]' '[:lower:]')/$(echo "ROMANSHKVOLKOV" | tr '[:upper:]' '[:lower:]'):$SHORT_SHA" \
  CADDY_HOST="domain.example.com" \
  CADDY_TLS="jose@guz-studio.dev"
#add more envs here same on the build_deployment.sh
>./romanshkvolkov.prod.deployment.yml
