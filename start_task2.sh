#!/bin/bash
set -e

# ── Check for uncommitted changes ────────────────────────────────────────────
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "You have uncommitted changes in your working tree."
    echo "Please commit or stash them before starting Task 2."
    exit 1
fi

if [ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
    echo "You have untracked files in your working tree."
    echo "Please commit or stash them before starting Task 2."
    exit 1
fi

# ── Confirmation prompt (default: No) ────────────────────────────────────────
read -r -p "This will set up Task 2. Proceed? [y/N] " REPLY
case "$REPLY" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted by user."; exit 0 ;;
esac

# ── Remove existing .github folder ───────────────────────────────────────────
if [ -d ".github" ]; then
    echo "Removing existing .github/ directory..."
    rm -rf .github
fi

# ── Unpack Task 2 artifacts ──────────────────────────────────────────────────
if [ -f ".__private__/task2.zip" ]; then
    echo "Unpacking .__private__/task2.zip artifacts to project root..."
    unzip -o .__private__/task2.zip -d .
else
    echo "ERROR: .__private__/task2.zip not found!"
    exit 1
fi

# ── Commit all changes as chore ──────────────────────────────────────────────
git add -A
git commit -m "chore: setup Task 2 artifacts"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "Task 2 is ready!"
echo "You can now start working on Task 2."
