# Linking CM Inspect to Pronto

## Link format
| Purpose | Link |
|---|---|
| PM task text (generic) | `lusaacjean-debug.github.io/cm/?pm=<PM task>` |
| Single plant item | `lusaacjean-debug.github.io/cm/?pm=<PM task>&t=<plant item>` |
| Work order / QR code | `…?pm=<PM task>&t=<plant item>&w=<work order>` |
| Direct by checklist | `…?c=<checklist id>&tag=<plant item>&wo=<work order>` |

Pronto Task Text wraps at about 60 characters, so always use the short `?pm=` form on one line.

## Steps (no administrator needed)
1. Pronto → **PM Tasks** → Find the task → **Task Text**.
2. Keep the first line (task title), press Enter twice, paste the three lines from the link-load workbook (column R).
3. **Save**. Every work order generated afterwards carries the link.

## Mapping maintenance
* `data/pm-task-map.js` holds PM task → checklist. When a new PM task is created, add a line `"<task>": "<checklist id>",` through a pull request.
* Work orders generated before the link was added: use the weekly plan workbook (links with tag and WO).

## With the administrator (later)
Bulk load of the task text, a QR code on the work order print, frequency and data corrections.
