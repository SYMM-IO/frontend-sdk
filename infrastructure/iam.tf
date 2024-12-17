resource "aws_iam_role" "symmio_frontend_sdk_role" {
  name        = var.symmio_frontend_sdk_role_name
  description = "The service role that will be used by AWS Amplify for Web Compute app logging."
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      },
    ]
  })
  path = "/service-role/"
}

# AmplifySSRLoggingPolicy
data "aws_iam_policy_document" "amplify_inline_policy" {
  statement {
    sid       = "PushLogs"
    effect    = "Allow"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/amplify/*:log-stream:*"]
  }

  statement {
    sid       = "CreateLogGroup"
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup"]
    resources = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/amplify/*"]
  }

  statement {
    sid       = "DescribeLogGroups"
    effect    = "Allow"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:*"]
  }
}

resource "aws_iam_policy" "amplify_inline_policy" {
  name   = replace(var.symmio_frontend_sdk_role_name, "Role", "Policy")
  policy = data.aws_iam_policy_document.amplify_inline_policy.json
  path   = "/service-role/"
}
