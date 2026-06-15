---
mode: agent
tools:
  - run_in_terminal
description: Start a new brains-back task iteration by running brainsback init with a task description.
---

Ask the user: "What is the task description for this iteration?" (a short summary of the goal, e.g. "Add user authentication").

Then run the following command in the terminal, replacing `<task description>` with the user's answer:

```sh
brainsback init "<task description>"
```

After the command completes, tell the user to fill out the `TODO.md` file in the newly created task folder with their strategic blueprint before asking you to implement anything.
