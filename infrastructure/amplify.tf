resource "aws_amplify_app" "symmio_frontend_sdk" {
  name       = "symmio-frontend-sdk-${var.environment_name}"
  repository = var.amplify_repository

  enable_basic_auth      = var.amplify_enable_basic_auth
  basic_auth_credentials = base64encode(var.amplify_basic_auth_credentials)
  build_spec             = var.amplify_build_spec
  dynamic "custom_rule" {
    for_each = var.amplify_custom_rule != null ? [var.amplify_custom_rule] : []
    content {
      condition = try(custom_rule.value.condition, null)
      source    = custom_rule.value.source
      status    = try(custom_rule.value.status, null)
      target    = custom_rule.value.target
    }
  }
  environment_variables = merge(var.amplify_environment_variables, var.amplify_remote_environment_variables)
  iam_service_role_arn  = aws_iam_role.symmio_frontend_sdk_role.arn
  platform              = var.amplify_platform
}

resource "aws_amplify_branch" "develop" {
  app_id      = aws_amplify_app.symmio_frontend_sdk.id
  branch_name = "develop"
  framework   = "Next.js - SSR"
  stage       = "PRODUCTION"
}

resource "aws_amplify_domain_association" "symmio_custom_domain" {
  app_id                = aws_amplify_app.symmio_frontend_sdk.id
  domain_name           = var.amplify_custom_domain
  wait_for_verification = false

  certificate_settings {
    type = "AMPLIFY_MANAGED"
  }

  sub_domain {
    branch_name = aws_amplify_branch.develop.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.develop.branch_name
    prefix      = "www"
  }
}
