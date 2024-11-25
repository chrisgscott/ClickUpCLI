# ClickUp Exports

This directory contains exported task data from ClickUp. Use dated filenames for exports and move older exports to the `archive` directory.

## Example Usage
```bash
# Export current tasks with date
task export --format yaml > $(date +%Y%m%d)_tasks.yml

# Archive old exports
mv old_export.yml archive/
```
