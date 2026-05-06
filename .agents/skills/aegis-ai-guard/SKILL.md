```markdown
# aegis-ai-guard Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill outlines the core development patterns and workflows for the `aegis-ai-guard` TypeScript codebase. It covers coding conventions, file organization, commit styles, and the main project workflow for updating documentation. This guide is designed to help contributors maintain consistency and efficiency when working on the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `aiGuard.ts`, `userManager.test.ts`

### Imports
- Use **absolute import paths**.
  - Example:
    ```typescript
    import { validateUser } from 'utils/validation';
    ```

### Exports
- Use **named exports** exclusively.
  - Example:
    ```typescript
    // In aiGuard.ts
    export function guardLogic() { ... }
    export const GUARD_CONSTANT = 42;
    ```

### Commit Messages
- Commit types are mixed, with common prefixes like `docs` and `chore`.
- Keep commit messages concise (average: ~31 characters).
  - Example: `docs: update usage section`

## Workflows

### Update README Documentation
**Trigger:** When someone wants to update or replace the main project documentation.  
**Command:** `/update-readme`

1. Edit `README.md` with new or updated information.
2. Commit your changes with a message referencing documentation or README.
   - Example: `docs: revise installation steps`
3. Push your changes and open a pull request if required.

## Testing Patterns

- Test files follow the pattern: `*.test.*`
  - Example: `aiGuard.test.ts`
- The testing framework is not explicitly specified; check existing test files for conventions.
- Example test file structure:
  ```typescript
  import { guardLogic } from 'aiGuard';

  describe('guardLogic', () => {
    it('should return true for valid input', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command         | Purpose                                         |
|-----------------|-------------------------------------------------|
| /update-readme  | Update or replace the main project documentation |

```