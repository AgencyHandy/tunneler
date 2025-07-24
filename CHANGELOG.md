# Unreleased
- Refactor service management with unified platform detection
- Add conditional service restart only when tunnel is running
- Implement centralized service uninstall utility
- Remove duplicate console output and code duplication
- Improve service operation error handling
- Add tunnel restart command for service management
- Refactor all service commands to use system utilities
- Improve cloudflared path detection with better error handling
- Add better platform type definitions and validation
- Enhance LaunchAgent error handling for macOS operations

# v0.3.1
- Fix correct path for `cloudflared` during service installation for linux

# v0.3.0
- Push compiled `src` to npm

# v0.2.4
- Add `dist/package.json` to package

# v0.2.3
- Remove `dist/package.json` from package

# v0.2.2
- Add `eslint.config.js` in `.npmignore`

# v0.2.1
- Remove duplicated instructions of Cloudflare API token
- Updated informatin about the project

# v0.2.0

- Cleaner UX
- Add command examples
- Run tunnel as service.
- See tunnel list
- See ingress routes of a tunnel
- Delete tunnel
- Check tunnel status

# v0.1.0

- Create tunnel(s)
- Add ingress rule to tunnel
- Remove ingress rule from tunnel
- Run tunnel in foreground
