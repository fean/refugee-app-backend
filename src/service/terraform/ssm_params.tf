resource "aws_ssm_parameter" "api_gw_id" {
  depends_on = [
    module.apigateway
  ]
  name = "/app/apigwv2/gateway/id"
  type = "SecureString"
  value = module.apigateway.api_gateway_id
}

resource "aws_ssm_parameter" "api_gw_authorizer_id" {
  depends_on = [
    module.apigateway
  ]
  name = "/app/apigwv2/authorizer/id"
  type = "SecureString"
  value = module.apigateway.jwt_authorizer_id
}

resource "aws_ssm_parameter" "lambda_security_group" {
  depends_on = [
    aws_security_group.lambda_sg
  ]
  name = "/app/vpc/security-group/lambda/id"
  type = "SecureString"
  value = aws_security_group.lambda_sg.id
}
