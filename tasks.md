# Tasks

## Fix Priority Handling in List and Export Commands

The list and export commands are failing due to incorrect priority handling when tasks are returned from ClickUp.

Issues to Fix:
- Handle null/undefined priority in task responses
- Update priority display format in list command
- Update priority handling in export command
- Add proper error handling for missing priority
- Update tests to cover priority edge cases

Steps to Reproduce:
1. Create tasks with different priorities
2. Run 'task list' or 'task export'
3. Observe TypeError about reading priority property

Error Message:
TypeError: Cannot read properties of null (reading 'priority')

Affected Commands:
- task list
- task export

- Status: to do
- Priority: urgent
- ID: 868azfq3n

---

## Add Status Option to Task Creation

The CLI currently doesn't support setting the status when creating a new task. We need to add this functionality to both the CLI interface and the underlying service.

Features to Add:
- Add --status option to add command
- Fetch available statuses from ClickUp
- Validate status against available options
- Update createTask service to handle status
- Add status to interactive prompt

Implementation Details:
1. Update add.ts command:
   - Add status option
   - Add status to interactive prompt
   - Validate status input

2. Update clickup.ts service:
   - Add status parameter to createTask function
   - Add validation for status values

3. Update tests:
   - Add tests for status parameter
   - Add tests for status validation

Example Usage:
```bash
task add --name "New Task" --status "bug"
task add --name "Feature" --status "in progress"
```

- Status: to do
- Priority: high
- ID: 868azfq0u

---

## Fix Subtask Creation in CLI

The CLI is not properly creating subtasks when using the add command. Tasks that should be created as subtasks are being created as regular tasks instead.

Issues to Fix:
- Verify parent task ID handling in add command
- Check if subtask creation endpoint is being called correctly
- Ensure proper error handling for subtask creation
- Add proper validation for parent task existence
- Update tests to cover subtask creation

Steps to Reproduce:
1. Create a parent task
2. Attempt to create a subtask using the add command
3. Observe that the task is created as a regular task instead of a subtask

Expected Behavior:
- When creating a task with --parent-id specified, it should be created as a subtask
- The subtask should appear nested under its parent in the task list

Current Behavior:
- Tasks are always created as top-level tasks
- Parent-child relationship is not being established

- Status: to do
- Priority: urgent
- ID: 868azfq0g

---

## Multi-Platform Task Management Support

Add support for multiple task management platforms beyond ClickUp. Implement a modular architecture that allows users to choose and switch between different task management platforms while maintaining a consistent CLI interface.

Features:
- Platform selection during initial setup
- Abstract interface for task management operations
- Platform-specific adapters
- Configuration management for multiple platforms
- Easy platform switching
- Data migration tools between platforms

Architectural Considerations:
- Use adapter pattern for different platforms
- Create abstract TaskManager interface
- Implement platform-specific authentication flows
- Handle platform-specific features gracefully
- Maintain consistent CLI commands across platforms

Example Usage:
```bash
# Initial setup
task config --platform jira
task config --platform clickup

# Switch between platforms
task platform use jira
task platform use clickup

# Platform-agnostic commands remain the same
task list
task add "New task"
task update <id> --status "In Progress"
```

- Status: to do
- Priority: high
- ID: 868azfpxj

---

## Webhook Integration

Add support for webhook integrations with external services.

Features:
- Configure webhook endpoints
- Custom payload templates
- Event filtering
- Retry logic
- Webhook logs

Example usage:
task webhook add --url https://api.example.com/webhook --events task.created,task.updated
task webhook list
task webhook logs

- Status: to do
- Priority: normal
- ID: 868azfp4y

---

## Attachments Support

Add support for managing task attachments.

Features:
- Upload attachments
- Download attachments
- List attachments
- Remove attachments
- Bulk attachment operations

Example usage:
task attach <task-id> file.pdf
task attachments list <task-id>
task attachment download <attachment-id>

- Status: to do
- Priority: normal
- ID: 868azfp42

---

## Recurring Tasks Support

Add support for creating and managing recurring tasks.

Features:
- Create recurring tasks
- Custom recurrence patterns
- Skip occurrences
- Modify future occurrences
- View recurring task series

Example usage:
task add --recurring "every 2 weeks"
task recurring list
task recurring skip <task-id>

- Status: to do
- Priority: high
- ID: 868azfp34

---

## Automated Status Updates

Add support for automated task status updates based on various triggers.

Features:
- Git branch/PR status triggers
- Time-based triggers
- Dependency-based triggers
- Custom trigger rules
- Webhook support

Example usage:
task automate add --when "pr_merged" --set-status "Done"
task automate add --when "dependency_complete" --set-status "Ready"

- Status: to do
- Priority: high
- ID: 868azfp2k

---

## Custom Aliases and Shortcuts

Add support for custom command aliases and shortcuts.

Features:
- Define custom aliases
- Command shortcuts
- Parameter presets
- Import/export aliases

Example usage:
task alias add ip "in-progress --priority 2"
task alias add urg "update --set-priority 1"
task ip "New urgent task"

- Status: to do
- Priority: normal
- ID: 868azfp1y

---

## Task History and Activity Log

Add support for viewing task history and activity logs.

Features:
- View task change history
- Activity feed
- Filter activities by type
- Export activity logs
- Audit trail

Example usage:
task history <task-id>
task activity --filter type=status_change --days 7

- Status: to do
- Priority: normal
- ID: 868azfp17

---

## Task Dependencies Visualization

Add visualization support for task dependencies and relationships.

Features:
- View task dependencies in tree format
- Show blocked/blocking tasks
- Dependency cycle detection
- Export dependency graph

Example usage:
task deps show <task-id>
task deps tree --export=deps.dot

- Status: to do
- Priority: normal
- ID: 868azfnzn

---

## Custom Field Support

Add support for viewing and managing custom fields in ClickUp tasks.

Features:
- View custom fields
- Update custom field values
- Filter by custom fields
- Custom field templates

Example usage:
task update <task-id> --set-field "Story Points=5"
task list --filter "custom.department=Engineering"

- Status: to do
- Priority: normal
- ID: 868azfnz8

---

## Interactive Task Browser (TUI)

Add an interactive terminal user interface for browsing and managing tasks.

Features:
- Navigate tasks with arrow keys
- Quick actions menu
- Task details view
- Keyboard shortcuts
- Live updates

Example usage:
task browse
task tui

- Status: to do
- Priority: high
- ID: 868azfnyp

---

## Time Tracking Integration

Add time tracking capabilities integrated with ClickUp's time tracking.

Features:
- Start/stop time tracking
- View time tracked
- Add time entry manually
- Time tracking reports

Example usage:
task time start <task-id>
task time stop
task time add <task-id> 2h30m

- Status: to do
- Priority: normal
- ID: 868azfnyd

---

## Git Integration

Add integration with Git for task-related workflows.

Features:
- Create branch from task
- Link commits to tasks
- Auto-update task status based on branch/PR status
- Create PR with task details

Example usage:
task git create-branch <task-id>
task git link-commit <task-id> [--message]

- Status: to do
- Priority: high
- ID: 868azfnxu

---

## Rich Task Description Support

Add support for rich text formatting in task descriptions using markdown.

Features:
- Markdown formatting support
- Code block support
- Table support
- Image links
- Task preview command

Example usage:
task add --markdown-file task.md
task preview <task-id>

- Status: to do
- Priority: normal
- ID: 868azfnxm

---

## Batch Operations Support

Add support for performing operations on multiple tasks at once.

Features:
- Update multiple tasks' status
- Update multiple tasks' priority
- Delete multiple tasks
- Move multiple tasks to different list

Example usage:
task update --filter status=in_progress --set-status=complete
task update --filter priority=low --set-priority=normal

- Status: to do
- Priority: high
- ID: 868azfnx4

---

## Task Templates Support

Add support for task templates to quickly create common task types.

Features:
- Save task as template
- Create task from template
- List available templates
- Edit/delete templates

Example usage:
task template save current-task my-template
task add --from-template my-template

- Status: to do
- Priority: high
- ID: 868azfnwq

---

## Implement Filtering and Sorting

Add support for filtering tasks by various criteria (status, priority, due date) and sorting options (creation date, priority, etc.).

Features:
- Filter by status, priority, due date, tags
- Sort by creation date, due date, priority
- Support for multiple filters
- Reverse sort option

Example usage:
task list --filter status=in_progress --sort priority
task list --filter-tags bug,feature --sort-reverse

- Status: to do
- Priority: urgent
- ID: 868azfnwe

---

