## Definition of done

Before declaring a feature or task complete:

1. Run the relevant unit and integration tests.
2. Run linting and type checks.
3. For user-visible changes, run the app locally and verify the affected flow in the browser.
4. Add or update automated tests for new behavior and regression cases.
5. Report: commands run, test results, files changed and any known limitations.

Do not mark a task complete if tests fail, the dev server has console errors, or acceptance criteria are unverified.

## Commit Rules

Before committing any change, first test the implementation if test of that implementation is possible. 
Make commits in such a way that each implementation has a non-breaking rollback. 

## Commenting Rules

Make as few comments as possible in the codebase. Only comment on functions which are harder or longer to understand for users and agents. If adding a comment in the codebase, make sure it is crisp and to the point. 