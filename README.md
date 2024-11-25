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
- Bulk configuration management through YAML files
- Automatic backup creation before applying changes

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

# List all tasks including subtasks (subtasks will be indented under their parent tasks)
task list

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

# Create a subtask (use -t or --parent to specify the parent task ID)
task add "Write tests" -t abc123 --description "Unit tests for auth module" --priority 2 --status "backlog"

# Alternative way to create a subtask using long form
task add "Write tests" --parent abc123 --description "Unit tests for auth module" --priority 2 --status "backlog"

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

### Bulk Configuration Management

The CLI supports bulk configuration management through YAML files. You can define tags and tasks in a YAML file and apply them all at once.

#### Supported Configuration Items

The following items can be configured via YAML:

1. **Tags**:
   - Name (required)
   - Background color (hex format, e.g., "#FF9900")
   - Foreground color (hex format, e.g., "#FFFFFF")

2. **Tasks**:
   - Name (required)
   - Description (optional)
   - Priority (1: urgent, 2: high, 3: normal, 4: low)
   - Status
   - Tags (list of tag names)
   - Due date (format: YYYY-MM-DD)
   - Assignees (list of assignee IDs)

Note: Some ClickUp features like custom fields, attachments, time tracking, dependencies, and subtasks must be managed through the ClickUp web interface or individual CLI commands.

#### YAML File Structure
```yaml
# Define custom tags with colors
tags:
  - name: "review"
    bg_color: "#FF9900"  # Background color
    fg_color: "#FFFFFF"  # Text color
  - name: "bug"
    bg_color: "#FF0000"
    fg_color: "#FFFFFF"
  - name: "feature"
    bg_color: "#00FF00"
    fg_color: "#000000"

# Define tasks with their properties
tasks:
  - name: "Implement user authentication"
    description: "Add OAuth2 authentication flow for users"
    priority: 3  # 1: urgent, 2: high, 3: normal, 4: low
    status: "backlog"
    due_date: "2024-02-15"  # Optional, format: YYYY-MM-DD
    tags: ["feature"]  # Optional, reference to defined tags
    assignees: ["user123"]  # Optional, list of user IDs
```

#### Applying Configuration
```bash
# Apply changes from a YAML file
task apply --file changes.yml

# Preview changes without applying them
task apply --file changes.yml --dry-run

# Export current configuration to YAML
task export --format yaml > current-config.yml
```

#### Bulk Task Creation
```bash
# Apply tasks from a YAML file
task apply -f tasks.yml

# Preview changes without applying them
task apply -f tasks.yml --dry-run
```

Example YAML structure for bulk task creation:
```yaml
tasks:
  - name: "Project Setup"
    description: "Initial project setup and configuration"
    priority: 2          # 1: urgent, 2: high, 3: normal, 4: low
    status: "to do"
    due_date: "2024-03-15"
    subtasks:
      - name: "Environment Setup"
        description: "Set up development environment"
        priority: 2
        status: "to do"
        subtasks:
          - name: "Install Dependencies"
            description: "Install and configure project dependencies"
            priority: 3
            status: "to do"
          - name: "Configure Tools"
            description: "Set up development tools"
            priority: 3
            status: "to do"
      - name: "Documentation"
        description: "Create initial documentation"
        priority: 3
        status: "to do"
```

The YAML file supports:
- Unlimited nesting of subtasks
- Task properties: name, description, priority, status, due_date
- Automatic parent-child relationship handling
- Bulk creation of entire task hierarchies

### Backup Management

Backups are automatically created in `~/.task-cli/backups` before applying any changes. Each backup is timestamped and contains the complete configuration at that point.

You can restore from a backup using:
```bash
# List available backups
task backup list

# Restore from a specific backup
task backup restore config-2024-01-01T12-00-00.yml
```

### Configuration

The CLI stores its configuration in `~/.task-cli/config.json`. This includes:
- ClickUp API token
- Default workspace ID
- Default space ID
- Default list ID
- Custom color schemes
- Other preferences

You can update these settings using:
```bash
# Set API token
task config set token YOUR_API_TOKEN

# Set default workspace
task config set workspace WORKSPACE_ID

# Set default space
task config set space SPACE_ID

# Set default list
task config set list LIST_ID
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
