resource "aws_apigatewayv2_api" "api_gateway" {
  name = var.service_name
  protocol_type = "HTTP"
  cors_configuration {
    max_age = 86400
    allow_credentials = false
    allow_headers = var.cors_allowed_headers
    allow_origins = var.cors_allowed_origins
    allow_methods = ["GET", "POST", "DELETE", "PUT"]
  }
}

resource "aws_cloudwatch_log_group" "api_logging" {}

resource "aws_apigatewayv2_stage" "api_default_stage" {
  depends_on = [
    aws_apigatewayv2_api.api_gateway,
    aws_cloudwatch_log_group.api_logging,
  ]
  name = "$default"
  auto_deploy = true
  api_id = aws_apigatewayv2_api.api_gateway.id
}

resource "aws_apigatewayv2_domain_name" "api_domain_name" {
  domain_name = var.api_url
  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  depends_on = [
    aws_apigatewayv2_api.api_gateway,
    aws_apigatewayv2_domain_name.api_domain_name,
    aws_apigatewayv2_stage.api_default_stage,
  ]
  api_id = aws_apigatewayv2_api.api_gateway.id
  domain_name = aws_apigatewayv2_domain_name.api_domain_name.id
  stage = aws_apigatewayv2_stage.api_default_stage.id
}

resource "aws_route53_record" "search_service_route" {
  depends_on = [
    aws_apigatewayv2_domain_name.api_domain_name
  ]
  name = var.api_url
  type = "A"
  alias {
    name = aws_apigatewayv2_domain_name.api_domain_name.domain_name_configuration[0].target_domain_name
    zone_id = aws_apigatewayv2_domain_name.api_domain_name.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
  zone_id = var.route_53_zone_id
}

resource "aws_apigatewayv2_authorizer" "jwt_authorizer" {
  depends_on = [
    aws_apigatewayv2_api.api_gateway
  ]
  api_id = aws_apigatewayv2_api.api_gateway.id
  authorizer_type = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name = "JWTAuthorizer"
  jwt_configuration {
    audience = var.jwt_authorizer_audience
    issuer = var.jwt_authorizer_issuer
  }
}
