## Future feature

- Support additional and custom chain( building your own chain object that inherits the **AddressMap** type)
- Integration with uniswap provider
- refactor filter(sort) function in sdk(get better performance)
- write a hook to get quote and calculate pnl or Upnl

## Future improvement Changes

- change the structure of `icon folder` definition and usage, remove extra icon and integrate public and icon component
- Clean nextjs code
- Add previous account code to sdk project
- Update packages (e.g. recharts)
- resolve bug: when speedup pending transaction cause change the hash of transaction and cause error in site
- redesign the structure of checking pending transactions and use watch transaction wagmi
- change the name of project from "symm-client" to 'symmio-frontend-sdk'
- refactor deposit/withdraw modal( use different modal. now use same component)
- checking project license with managers
- talking about server for rpc forward to hidden apiKey
- rearrange type in sdk (now they are distributed in project)
- move the function fetchPriceRange to the sdk
- use one of BigInt and bigNumber.js
- show balances in deposit modal fix
- move thena to sdk
- move testNet branch to sdk
- move pear to sdk

## Explanation

here is a detailed explanation of the `postbuild` command defined in the `package.json` :
