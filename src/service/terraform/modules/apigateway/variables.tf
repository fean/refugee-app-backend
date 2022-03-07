variable "api_url" {
  type = string
  description = "The url the api should be located at."
}

variable "service_name" {
  type = string
}

variable "certificate_arn" {
  type = string
  description = "The certificate arn for the ssl service"
}

variable "route_53_zone_id" {
  type = string
  description = "The zone id of the route53 record set group"
}

variable "jwt_authorizer_audience" {
  type = set(string)
  default = []
  description = "The audience for the jwt authorizer"
}

variable "jwt_authorizer_issuer" {
  type = string
  description = "The issuer for the jwt authorizer"
}

variable "cors_allowed_origins" {
  type = set(string)
  default = []
  description = "A list of allowedOrigins starting with https://"
}

variable "cors_allowed_headers" {
  type = set(string)
  default = []
  description = "A list of allowed headers starting with https://"
}

