import argparse
import json


def main():
    # Parse arguments
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--config", help="Path to the AWS ECS Scaling definition YAML file.", required=True)
    parser.add_argument(
        "--environment", help="Specify the environment", required=True)
    args = parser.parse_args()

    # Parse the config file as JSON
    with open(args.config, "r") as file:
        config = json.load(file)
    # Access symmIdToMultiaccounts from globals
    symm_accounts = config['globals']['symmIdToMultiaccounts']
    env_strings = []
    # Iterate and print key + first address
    for symm_id, addresses in symm_accounts.items():
        hedger_addresses = addresses
        party_b_address = config['perSymmId'][symm_id]['symm']['partyBAddress']
        env_strings.append(generate_templates(
            symm_id, hedger_addresses, party_b_address, args.environment))
    write_tfvars_file(env_strings)


def generate_templates(symm_id: str, hedger_addresses: list[str], party_b_address: str, environment: str) -> str:
    environment = environment + '.' if environment != 'prod' else ''
    all_templates = []

    for hedger_address in hedger_addresses:
        templates = [
            f'"NEXT_PUBLIC_{symm_id}_{hedger_address}_HEDGER_URL"   = "www.{
                environment}perps-streaming.com/v1/{symm_id}/{hedger_address}/"',
            f'"NEXT_PUBLIC_{symm_id}_{
                hedger_address}_MULTIACCOUNT" = "{hedger_address}"',
            f'"NEXT_PUBLIC_{symm_id}_{
                hedger_address}_PARTY_B"      = "{party_b_address}"'
        ]
        all_templates.extend(templates)

    return '\n'.join(all_templates)


def write_tfvars_file(env_vars_list, output_path="terraform.tfvars"):
    """
    Write environment variables to a tfvars file in the correct format.

    Args:
        env_vars_list (list): List of environment variable strings
        output_path (str): Path to output tfvars file
    """
    try:
        # Format the content as a Terraform map variable
        content = 'amplify_remote_environment_variables = {\n'
        content += '\n'.join(f'  {var}' for var in env_vars_list)
        content += '\n}'

        # Write to file
        with open(output_path, 'w') as f:
            f.write(content)

        return True
    except Exception as e:
        print(f"Error writing tfvars file: {str(e)}")
        return False


if __name__ == "__main__":
    main()
