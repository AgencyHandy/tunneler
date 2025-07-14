# Contributing to Tunneler

Thank you for your interest in contributing to Tunneler! We welcome all kinds of contributions, including bug fixes, new features, and documentation improvements.

## Prerequisites

- **Node.js 16.x** is required. Please ensure you are using Node 16 before contributing.
- **Yarn** is used for dependency management. Install it globally if you haven’t already:
  ```bash
  npm install -g yarn
  ```

## Workflow

1. **Fork the repository**  
   Click the "Fork" button on GitHub to create your own copy of the repository.

2. **Clone your fork**  
   ```bash
   git clone https://github.com/<your-username>/tunneler.git
   cd tunneler
   ```

3. **Create a new branch**  
   Name your branch according to the feature or fix you are working on:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-description
   ```

4. **Install dependencies**  
   ```bash
   yarn install
   ```

5. **Make your changes**  
   Edit or add files as needed.

6. **Lint and format your code**  
   Run the following commands before committing to ensure code quality and consistency:
   ```bash
   yarn lint
   yarn format
   ```

7. **Test your changes**  
   If the project has tests, run them to make sure nothing is broken:
   ```bash
   yarn test
   ```
   (If there are no tests yet, you can skip this step.)

8. **Commit your changes**  
   Use clear and descriptive commit messages. For example:
   ```
   feat(route): add support for custom domains
   fix(tunnel): handle error when port is in use
   ```

9. **Push your branch to your fork**  
   ```bash
   git push origin <your-branch-name>
   ```

10. **Create a Pull Request (PR)**  
    - Go to the original repository on GitHub.
    - Click "Compare & pull request".
    - Fill in the PR template, describing your changes and why they are needed.
    - Submit the PR.

## Code Style

- Follow the existing code style and structure.
- Use `yarn lint` and `yarn format` to automatically fix most issues.
- Prefer descriptive variable and function names.

## Code Review

- All PRs are subject to code review.
- Be responsive to feedback and make requested changes.
- Squash or rebase your commits if asked.

## Other Tips

- Keep your branches up to date with the base branch.
- If you add or change dependencies, explain why in your PR.
- Update documentation if your changes affect usage or APIs. 