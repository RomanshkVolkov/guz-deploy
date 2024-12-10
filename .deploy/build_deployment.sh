#!/bin/bash

deployment_dir=".deploy"

declare -A params=(
  [STACK]=""
  [IMAGE]=""
  [CADDY_HOST]=""
  [CADDY_TLS]=""
  ## env vars
  [DEPLOYMENT_ENVIROMENT]=""
  [DATABASE_URL]=""
  [SECRET_NEXT_AUTH]=""
  [MAIL_EMAIL]=""
  [MAIL_PASSWORD]=""
)

for arg in "$@"; do
  case $arg in
  *=*)
    key="${arg%%=*}"
    value="${arg#*=}"

    if [[ -z "${params[$key]}" ]]; then
      params[$key]="$value"
      if [[ -z "$value" ]]; then
        echo "Missing value for $key"
        exit 1
      fi
    fi
    ;;
  esac
done
# Deploy the stack

yaml_content=$(cat "$deployment_dir/deployment.template.yml")

# envs

if [ -f "$env_file" ]; then
  while IFS='=' read -r key value; do
    if [[ -n "$key" && -n "$value" && "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
      export "$key=$value" >/dev/null 2>&1
    fi
  done < <(grep -v '^#' "$env_file")
else
  while IFS='=' read -r key value; do
    if [[ "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ && -n "$value" ]]; then
      export "$key=$value" >/dev/null 2>&1
    fi
  done < <(env)
fi

for var in $(env | grep '^DEPLOY_'); do
  IFS='=' read -r key value <<<"$var"
  cleaned_key="${key#DEPLOY_}"

  yaml_content=$(echo "$yaml_content" | yq eval ".services.STACK_PLACEHOLDER-app.environment += [\"$cleaned_key=$value\"]")
done

function replace_env() {
  env_name="${1}_PLACEHOLDER"
  env_value=$2
  # for debug
  # echo "Replacing $env_name with $env_value"

  yaml_content=$(echo "$yaml_content" | sed "s|$env_name|$env_value|g")
}

# raplace all args on the template
for key in "${!params[@]}"; do
  replace_env "$key" "${params[$key]}"
done

#replace_env "STACK_PLACEHOLDER" "$stack-$environment"
replace_env "STACK_PLACEHOLDER" "${params[STACK]}${params[DEPLOYMENT_ENVIROMENT]}"

echo "$yaml_content"
