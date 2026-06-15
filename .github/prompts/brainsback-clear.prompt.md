---
mode: agent
tools:
  - run_in_terminal
description: Reset the current brains-back iteration by clearing REPORT.md and resetting TODO.md and REACTO.md to their templates.
---

Warn the user: "This will delete `REPORT.md` and reset `TODO.md` and `REACTO.md` to their templates in the most recent task folder. Any uncommitted code changes will also be discarded."

If the user confirms, run:

```sh
brainsback clear --force
```

After clearing, remind the user to run `/brainsback-init` to start a new iteration, or to update the existing `TODO.md` manually if they want to continue the same task with a fresh slate.
