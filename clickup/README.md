# ClickUp Directory Structure

This directory contains files related to ClickUp task management:

## Structure

```
clickup/
├── imports/          # YAML files for importing tasks into ClickUp
│   └── archive/     # Archived import files that have been processed
└── exports/         # Exported task data from ClickUp
    └── archive/     # Archived exports from previous backups
```

## Usage

### Imports Directory
- Place YAML files for task creation in the `imports` directory
- After successfully importing tasks, move the YAML file to `imports/archive`
- Example: `task apply -f clickup/imports/my-tasks.yml`

### Exports Directory
- Exported task data and backups are stored in the `exports` directory
- Previous exports can be moved to `exports/archive` for historical reference
- Example: `task export --format yaml > clickup/exports/$(date +%Y%m%d)_tasks.yml`

## Best Practices
1. Use descriptive filenames with dates for exports (e.g., `20240215_sprint_tasks.yml`)
2. Archive processed import files to maintain a clean working directory
3. Keep dated backups in the exports directory before making major changes
4. Use the archive directories to maintain history without cluttering the main directories
