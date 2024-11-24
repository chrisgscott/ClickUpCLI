# Task CLI

A command-line interface tool for managing ClickUp tasks directly from your terminal.

## Features

- Create and manage tasks from the command line
- View task hierarchies with subtasks
- List and filter tasks by status or priority
- Manage tags with custom colors
- Customize task statuses with colors
- Fast and user-friendly interface
- Interactive mode for easier management

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

## Usage Examples

### Task Management

#### Listing Tasks
```bash
# List all tasks in default list
task list

# List tasks with a specific status
task list --status "in progress"

# List tasks with specific priority
task list --priority high

# List tasks with specific tag
task list --tag "bug"

# List subtasks of a specific task
task list --task abc123

# Interactive task listing and management
task list --interactive
```

#### Creating Tasks
```bash
# Create a basic task
task add "Fix login bug"

# Create task with description and priority
task add "Update API docs" --description "Add examples for new endpoints" --priority high

# Create task with status and tags
task add "Refactor auth" --status "in progress" --tags "backend,security"

# Create a subtask
task add "Write tests" --parent abc123 --priority normal

# Interactive task creation
task add --interactive
```

#### Updating Tasks
```bash
# Update task status
task update abc123 --status "complete"

# Update task priority and description
task update abc123 --priority urgent --description "Critical security fix needed"

# Add tags to a task
task update abc123 --tags "urgent,security"

# Interactive task update
task update abc123 --interactive
```

#### Getting Task Details
```bash
# View detailed task information
task get abc123

# Export task details to markdown
task export abc123

# Export all tasks to markdown
task export
```

### Tag Management

#### Managing Tags
```bash
# List all tags
task tag --list

# Add a new tag with custom colors
task tag --add "Feature" --bg "#FF0000" --fg "#FFFFFF"

# Add a new tag (default colors)
task tag --add "Bug"

# Delete a tag
task tag --delete "Feature"

# Interactive tag management
task tag --interactive
```

### Status Management

#### Managing Statuses
```bash
# List all statuses
task status --list

# Add a new status
task status --add "In Review" --color "#FFA500"

# Add a status with order index
task status --add "Blocked" --color "#FF0000" --order 3

# Update status name and color
task status --update "In Progress" --name "In Development" --color "#00FF00"

# Delete a status
task status --delete "In Review"

# Interactive status management
task status --interactive
```

### Configuration

#### Managing Settings
```bash
# View current configuration
task config --show

# Set default list
task config --list abc123

# Set default space
task config --space xyz789

# Interactive configuration
task config --interactive
```

## Tips and Tricks

- Use the `--interactive` flag with any command for a guided experience
- Tab completion is available for most commands
- Colors in the terminal indicate priority and status
- Use `task --help` or `task [command] --help` for detailed command information
- Tags and statuses support custom colors using hex codes (e.g., "#FF0000")

## License

MIT
