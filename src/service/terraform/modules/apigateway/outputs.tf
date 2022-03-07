output "api_gateway_id" {
  value = aws_apigatewayv2_api.api_gateway.id
}

output "jwt_authorizer_id" {
  value = aws_apigatewayv2_authorizer.jwt_authorizer.id
}
