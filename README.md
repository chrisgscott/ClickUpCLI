# Task CLI

A command-line interface tool for managing ClickUp tasks directly from your terminal.

## Features

- 🚀 Create and manage tasks from the command line
- 📋 View task hierarchies with subtasks
- 🔍 List and filter tasks by status or priority
- 📊 Detailed task view with full description and metadata
- ⚡️ Fast and user-friendly interface

## Installation

```bash
# Install globally (recommended)
npm install -g @chrisgscott/task-cli

# The CLI will guide you through setup on first run
```

## Quick Start

1. Get your ClickUp API token from: https://app.clickup.com/settings/apps
2. Run any command (e.g., `task list`) and follow the setup prompt
3. Start managing your tasks!

## Usage

### Basic Commands

```bash
# List all tasks (hierarchical display with subtasks)
task list

# Filter tasks by status
task list --status "in progress"

# Filter tasks by priority
task list --priority "high"

# Get detailed information about a specific task
task get TASK_ID

# Create a new task
task add "New task name"

# Create a task with details
task add "Update API" -d "Update endpoint documentation" -p high -s "in progress"

# Create a subtask
task add "Implement auth" -t PARENT_TASK_ID

# Update a task
task update TASK_ID

# Delete a task
task delete TASK_ID

# Export tasks to markdown
task export
```

### Configuration

Your configuration is stored in `~/.task-cli/config.json`. You can update your configuration using:

```bash
# Configure CLI settings
task config
```

## License

MIT
