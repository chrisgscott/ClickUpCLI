# Task CLI

A command-line interface tool for managing ClickUp tasks directly from your terminal.

## Features

- 🚀 Create and manage tasks from the command line
- 📋 Create and manage subtasks
- 🔄 Interactive task creation and updates
- 📝 Task templates for common workflows
- 🎯 Priority and status management
- 🔍 List and filter tasks
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

### Task Management

```bash
# List all tasks
task list

# Create a new task
task add "New feature implementation"

# Create a task with details
task add "Update API" -d "Update endpoint documentation" -p 2 -s "in progress"

# Create a subtask
task add "Implement auth" -t PARENT_TASK_ID

# Update a task
task update TASK_ID

# List subtasks
task list -t TASK_ID
```

### Interactive Mode

Most commands support interactive mode for a more guided experience:

```bash
# Interactive task creation
task add

# Interactive task update
task update

# Interactive template selection
task add --template
```

### Using Templates

```bash
# List available templates
task template:list

# Create a new task from template
task add --template feature-dev

# Create template from existing task
task template:create --from TASK_ID

# Export template
task template:export TEMPLATE_NAME > template.json

# Import template
task template:import template.json
```

## Configuration

Your configuration is stored in `~/.task-cli/config.json`. You can edit this file directly or reconfigure using:

```bash
# Reconfigure interactively
task config --interactive

# Update specific settings
task config --token NEW_TOKEN
task config --workspace WORKSPACE_ID
task config --space SPACE_ID
task config --list LIST_ID
```

## Examples

### Creating a Feature Development Task

```bash
# Create parent task
task add "User Authentication Feature" -d "Implement user authentication system" -p 2

# Add subtasks
task add "API Design" -t PARENT_ID -d "Design authentication endpoints"
task add "Database Schema" -t PARENT_ID -d "Design user and session tables"
task add "Implementation" -t PARENT_ID -d "Implement authentication logic"
task add "Testing" -t PARENT_ID -d "Write unit and integration tests"
```

### Using Templates

```bash
# Create a new feature using the feature-dev template
task add --template feature-dev --var feature="Payment Integration" --var sprint=24
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
