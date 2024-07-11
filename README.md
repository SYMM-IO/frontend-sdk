# @symmio/frontend-sdk

## An SDK to interact with SYMMIO contracts, hedgers and peripherals.

### setup:

- First Execute the following command:

      yarn install

- Navigate to one of our apps folders. For example:

      cd apps/alpha/

- Obtain the `.env` file from the Frontend Developer.
- Execute the following command:

      yarn dev

- If you need to change the SDK file, you can find it in the `packages/core/` path

### More Info:

- To enable path completion suggestions in VSCode, first build the project by running yarn build. Then, in the VSCode settings, ensure that "TypeScript > Tsc: Auto Detect" is set to 'on'.

- Be sure not to use the publicProvider from Wagmi, as it causes some errors in the SDK. [Wagmi Website](https://wagmi.sh/core/getting-started#configure-chains):

  > Note: In a production app, it is not recommended to only pass publicProvider to configureChains as you will probably face rate-limiting on the public provider endpoints. It is recommended to also pass an alchemyProvider or infuraProvider as well.

- The `package.json` file defines a build-and-integrate command that automates the testing and building of the SDK and Client. This command involves the following steps:

  - Pre-build Script: The `node ./useful_script/pre_build.js` script removes the following configuration from the apps/nextjs/tsconfig.json file:

    ```
    "@symmio/frontend-sdk/_": [
    "../../packages/core/src/_"
    ]
    ```

    This is necessary because the Client code uses compiled JavaScript files for imported statements.

  - Build and Publish SDK: The `yalc publish` command builds the SDK project and publishes it to the local repository located at `~/.yalc/`. Yalc only moves the package files (dist and package.json) to the local repository.

  - Install SDK in Client: The `yalc add @symmio/frontend-sdk` command adds the SDK package file to the `node_modules` directory of the `apps/nextjs` project. This allows the Client to import the SDK's functionality.
  - Post-build Script: The `node ./useful_script/post_build.js` script adds the following configuration to the `apps/nextjs/tsconfig.json` file:
    ```
      "@symmio/frontend-sdk/*": [
        "../../packages/core/src/*"
      ]
    ```
  - This configuration ensures that the Client can correctly resolve and import the SDK's modules, even after it has been published locally and installed using the yalc add command
