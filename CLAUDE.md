@AGENTS.md

## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context; the club-wide glossary lives in TheRPGClub-api. See `docs/agents/domain.md`.

### Pull requests and versions

Each merge to main versions this repo, so a pull request title must be `type(scope)!: description` (`feat`, `fix`, `perf`, `refactor`, `chore`, `docs`, `test` or `ci`). `feat` bumps the minor version, `fix` and `perf` the patch version, and `!` (breaking) the major, only when the owner asks. Fill the PR template's optional `Patch note:` line with one sentence in members' words. Full rule: "Pull requests and versions" in `AGENTS.md`.
