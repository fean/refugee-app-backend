export $(cat .env | grep -v ^# | xargs)

aws s3 sync s3://refugee-app-deploys/api/terraform src/service/terraform

cd src/service/terraform

terraform init

terraform apply -auto-approve \
  -var "route53_ref_app_zone_id=${ZONE_ID}" \
  -var "jwt_authorizer_issuer=${AUTH0_DOMAIN}" \
  -var "jwt_authorizer_audience=${API_URL}" \
  -var "certificate_arn=${CERTIFICATE_ARN}" \
  -var "api_url=${API_URL}" \

cd ../../../

aws s3 sync src/service/terraform s3://refugee-app-deploys/api/terraform --delete --exclude '*' --include '*.tfstate' --include '*.hcl' --include '*.backup'
