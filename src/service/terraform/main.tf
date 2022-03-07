provider "aws" {
  region = "eu-west-1"
}

module "apigateway" {
  source = "./modules/apigateway"
  api_url = var.api_url
  certificate_arn = var.certificate_arn
  route_53_zone_id = var.route53_ref_app_zone_id
  jwt_authorizer_issuer = var.jwt_authorizer_issuer
  jwt_authorizer_audience = [var.jwt_authorizer_audience]
  cors_allowed_headers = [
    "Content-Type",
    "Authorization",
    "X-Organization-Id",
    "X-Api-Key"
  ]
  cors_allowed_origins = []
  service_name = "samaritan-api"
}

resource "aws_security_group" "lambda_sg" {
  provider = aws
  ingress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

