# General
variable "environment_name" {
  type        = string
  description = "Environment specific name"
}

variable "region" {
  type        = string
  default     = "ap-northeast-1"
  description = "AWS region used"
}

# AWS Amplify
variable "amplify_basic_auth_credentials" {
  type        = string
  description = "Basic auth credentials for AWS Amplify"
  default     = null
}

variable "amplify_build_spec" {
  type        = string
  description = "Build spec for AWS Amplify"
  default     = <<-EOT
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - yarn install
        build:
          commands:
            - yarn run build
      artifacts:
        baseDirectory: apps/Cloverfield/.next
        files:
          - '**/*'
      cache:
        paths:
          - .next/cache/**/*
          - node_modules/**/*
      buildPath: /
    appRoot: apps/Cloverfield
EOT
}

variable "amplify_custom_domain" {
  type        = string
  description = "Custom domain for AWS Amplify"
}

variable "amplify_custom_rule" {
  type        = map(string)
  description = "Custom rule for AWS Amplify"
  default = {
    "source" = "/<*>"
    "status" = "404-200"
    "target" = "/index.html"
  }
}

variable "amplify_enable_basic_auth" {
  type        = bool
  description = "Enable basic auth for AWS Amplify"
  default     = true
}

variable "amplify_environment_variables" {
  type        = map(string)
  description = "Environment variables for AWS Amplify"
  default     = {}
}

variable "amplify_remote_environment_variables" {
  type        = map(string)
  description = "Remote Environment variables for AWS Amplify"
  default     = {}
}

variable "amplify_platform" {
  type        = string
  description = "Platform for AWS Amplify"
  default     = "WEB_COMPUTE"
}

variable "amplify_repository" {
  type        = string
  description = "Target repository for AWS Amplify"
  default     = "https://github.com/orbs-network/symmio-frontend-sdk"
}

# AWS IAM
variable "symmio_frontend_sdk_role_name" {
  type        = string
  description = "Name of the role for AWS Amplify"
}
