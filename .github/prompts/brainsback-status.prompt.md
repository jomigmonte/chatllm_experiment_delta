---
mode: agent
tools:
  - run_in_terminal
description: Check the current brains-back workflow status, showing which artifacts are present and whether TODO.md has content.
---

Run the following command to check the brains-back workflow status for this project:

```sh
brainsback status
```

After the command completes, summarize:
- Which task folder is currently active (the most recent one under `.brainsback/`)
- Whether `TODO.md` has a strategy defined
- Whether `REPORT.md` and `REACTO.md` are present
- Whether the GitHub Copilot integration files are in place

If `TODO.md` is empty or missing, remind the user to fill it before asking you to implement anything.
