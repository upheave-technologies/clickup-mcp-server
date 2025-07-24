# ClickUp MCP Server

<p align="center">
  <img src="assets/images/clickupserverlogo.png" width="256" alt="ClickUp MCP Server Logo" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/clickup-mcp-server"><img src="https://img.shields.io/npm/v/clickup-mcp-server.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node.js Version"></a>
  <a href="https://github.com/modelcontextprotocol/typescript-sdk"><img src="https://img.shields.io/badge/MCP%20SDK-1.6.1-orange" alt="MCP SDK"></a>
</p>

A Model Context Protocol (MCP) server that provides a comprehensive, standardized interface for AI assistants to interact with the ClickUp API. This server enables AI systems to access and manipulate ClickUp data including workspaces, spaces, folders, lists, tasks, docs, comments, and checklists with advanced filtering and querying capabilities.

## 🚀 Key Features

- **✅ Complete workspace navigation** - Access any workspace details and information
- **✅ Project/space management** - Access any project/space with full details
- **✅ Unified task querying** - Single `get_tasks` function with comprehensive filtering
- **✅ Personal task management** - Filter to only your assigned tasks
- **✅ Daily completion tracking** - Find tasks completed today
- **✅ Advanced filtering** - Comprehensive date, status, assignee, and custom filtering
- **✅ Multi-scope queries** - Get tasks from lists, spaces, or entire workspaces
- **✅ Real-time queries** - Dynamic filtering with timestamp-based searches

## 📋 Available Tools

### **Authentication & User**
- `get_current_user`: Get current authenticated user information (including user ID for filtering)
- `get_workspaces`: Get list of accessible workspaces

### **Navigation & Structure**
- `get_spaces`: Get spaces within a workspace
- `get_folders`: Get folders from a space with archive filtering
- `get_lists`: Get lists from folder/space with archive filtering
- `get_folderless_lists`: Get lists not in any folder

### **Task Querying (Unified)**
- `get_tasks`: **Single unified function** to get tasks from lists, spaces, or teams with comprehensive filtering

### **Task Management**
- `get_task_details`: Get detailed information about a specific task
- `create_task`: Create new task with full parameter support
- `update_task`: Update existing task properties

### **Folder & List Management**
- `create_folder`: Create new folder in a space
- `update_folder`: Update folder name
- `delete_folder`: Delete folder and contents
- `create_list`: Create new list in folder or space
- `create_folderless_list`: Create list directly in space
- `update_list`: Update list properties
- `delete_list`: Delete list and tasks
- `add_task_to_list`: Add existing task to list
- `remove_task_from_list`: Remove task from list
- `create_list_from_template_in_folder`: Create list from template in folder
- `create_list_from_template_in_space`: Create list from template in space

### **Documents & Content**
- `get_docs_from_workspace`: Get all documents from workspace
- `get_doc`: Get specific document content
- `create_doc`: Create new document
- `update_doc`: Update document content

### **Comments & Collaboration**
- `get_task_comments`: Get comments from a task
- `get_list_comments`: Get comments from a list
- `get_doc_comments`: Get comments from a document  
- `create_task_comment`: Add comment to task
- `create_list_comment`: Add comment to list
- `create_doc_comment`: Add comment to document
- `update_comment`: Update existing comment
- `delete_comment`: Delete comment

### **Checklists**
- `get_task_checklists`: Get checklists from a task
- `create_checklist`: Create new checklist
- `update_checklist`: Update checklist
- `delete_checklist`: Delete checklist
- `create_checklist_item`: Add item to checklist
- `update_checklist_item`: Update checklist item

## 🎯 Unified get_tasks Function

The `get_tasks` function is the single, powerful way to retrieve tasks from ClickUp. It supports four different scopes:

### **Source Options (specify exactly one):**
- `list_id`: Get tasks from a specific list (fastest, direct API call)
- `folder_id`: Get tasks from entire folder (aggregated from all lists in folder)
- `space_id`: Get tasks from entire space/project (aggregated from all lists and folders)
- `team_id`: Get tasks from entire team/workspace (aggregated from all spaces)

### **Source + Filter Combinations:**
- `list_id` only: Direct list query
- `folder_id` + `list_ids`: Get tasks from specific lists within a folder
- `space_id` + `list_ids`: Get tasks from specific lists within a space
- `team_id` + `space_ids`: Get tasks from specific spaces within a workspace
- `team_id` + `list_ids`: Get tasks from specific lists across the entire workspace

### **Filters:**
- `assignees`: Filter by user IDs (array)
- `statuses`: Filter by status names (array)
- `due_date_gt/lt`: Filter by due date range
- `date_created_gt/lt`: Filter by creation date range  
- `date_updated_gt/lt`: Filter by last update date range
- `date_closed_gt/lt`: Filter by completion date range
- `tags`: Filter by task tags (array)
- `priority`: Filter by priority levels 1-4 (array)
- `custom_fields`: Advanced custom field filtering with operators
- `space_ids`: Limit to specific spaces (for team queries)
- `list_ids`: Limit to specific lists (for folder/space/team queries - filters results to only these lists)
- `include_closed`: Include/exclude closed tasks
- `subtasks`: Include/exclude subtask data
- `page`: Page number for pagination
- `order_by`: Field to sort by
- `reverse`: Reverse sort order

## 💡 Usage Examples

### Get Your User ID First
```javascript
const user = get_current_user();
// Returns: { id: 12345, username: "john", email: "john@company.com", ... }
```

### Get Your Tasks from Specific Project  
```javascript
get_tasks({
  space_id: "12345",
  assignees: [user.id],
  include_closed: false,
  order_by: "due_date"
})
```

### Get Tasks Completed Today (Your Tasks Only)
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
const startOfToday = today.getTime(); // Milliseconds
const endOfToday = new Date(today);
endOfToday.setHours(23, 59, 59, 999);

get_tasks({
  team_id: "workspace_123", 
  assignees: [user.id],
  date_closed_gt: startOfToday,
  date_closed_lt: endOfToday.getTime(), // Milliseconds
  include_closed: true
})
```

### Get High Priority Tasks from Entire Workspace
```javascript
get_tasks({
  team_id: "workspace_123",
  priority: [1, 2], // High and urgent priorities
  statuses: ["in progress", "review"],
  include_closed: false
})
```

### Get Tasks from Specific List (Fastest)
```javascript
get_tasks({
  list_id: "development_list_id",
  assignees: [user.id],
  statuses: ["open", "in progress"]
})
```

### Get Tasks from Entire Folder
```javascript
get_tasks({
  folder_id: "backend_folder_id",
  assignees: [user.id],
  statuses: ["open", "in progress"]
})
```

### Get Tasks from Specific Lists in a Folder
```javascript
get_tasks({
  folder_id: "backend_folder_id", 
  list_ids: ["api_list_id", "database_list_id"],
  assignees: [user.id]
})
```

### Get Tasks from Multiple Lists in a Space
```javascript
get_tasks({
  space_id: "treecall_space_id",
  list_ids: ["dev_list_id", "qa_list_id", "design_list_id"],
  assignees: [user.id]
})
```

### Real Example: "My tasks due tomorrow in treecall space, development list, open or in progress"
```javascript
// 1. Get your user ID (one time)
const user = get_current_user();

// 2. Calculate tomorrow's date range
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);
const tomorrowStart = tomorrow.getTime(); // Milliseconds
tomorrow.setHours(23, 59, 59, 999);
const tomorrowEnd = tomorrow.getTime(); // Milliseconds

// 3. Option A: Direct list query (fastest)
get_tasks({
  list_id: "development_list_id",
  assignees: [user.id],
  statuses: ["open", "in progress"],
  due_date_gt: tomorrowStart,
  due_date_lt: tomorrowEnd
})

// 3. Option B: Space + list filter (if you want to validate list belongs to space)
get_tasks({
  space_id: "treecall_space_id",
  list_ids: ["development_list_id"],
  assignees: [user.id],
  statuses: ["open", "in progress"],
  due_date_gt: tomorrowStart,
  due_date_lt: tomorrowEnd
})
```

### Get Tasks Across Multiple Spaces in Workspace
```javascript
get_tasks({
  team_id: "workspace_123",
  space_ids: ["project_a", "project_b"],
  assignees: [user.id],
  priority: [1, 2] // High priority only
})
```

## 📚 MCP Resources

The server exposes data via URI patterns:

- `clickup://task/{task_id}` - Individual task details
- `clickup://workspace/{workspace_id}/spaces` - All spaces in workspace
- `clickup://space/{space_id}` - Space details
- `clickup://list/{list_id}/tasks` - Tasks in list (supports query parameters for filtering)
- `clickup://list/{list_id}` - List details
- `clickup://doc/{doc_id}` - Document content

### Resource Query Parameters

The `clickup://list/{list_id}/tasks` resource supports URL query parameters:
```
clickup://list/123/tasks?statuses=open,in%20progress&assignees=456&due_date_gt=1672531200
```

## 🛠 Installation

```bash
git clone https://github.com/nsxdavid/clickup-mcp-server.git
cd clickup-mcp-server
npm install
npm run build
```

## ⚙️ Configuration

### Get ClickUp API Token
1. Log in to your ClickUp account
2. Go to **Settings** > **Apps**  
3. Click **"Generate API Token"**
4. Copy the generated token

### MCP Settings Configuration

```json
{
  "mcpServers": {
    "clickup": {
      "command": "node",
      "args": ["/path/to/clickup-mcp-server/build/index.js"],
      "env": {
        "CLICKUP_API_TOKEN": "YOUR_API_TOKEN_HERE"
      }
    }
  }
}
```

### Configuration File Locations

**Claude Desktop:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Cline VSCode Extension:**
- `~/.vscode/extensions/saoudrizwan.claude-dev/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

## 🔧 Development

### Building
```bash
npm run build
```

### Running in Development
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📖 API Reference

### get_tasks Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| **Source (pick one)** | | |
| `list_id` | `string` | Get from specific list |
| `folder_id` | `string` | Get from entire folder |
| `space_id` | `string` | Get from entire space |
| `team_id` | `string` | Get from entire workspace |
| **Filters** | | |
| `assignees` | `number[]` | Filter by user IDs |
| `statuses` | `string[]` | Filter by status names |
| `due_date_gt` | `number` | Due date after timestamp (Unix milliseconds) |
| `due_date_lt` | `number` | Due date before timestamp (Unix milliseconds) |
| `date_created_gt` | `number` | Created after timestamp (Unix milliseconds) |
| `date_created_lt` | `number` | Created before timestamp (Unix milliseconds) |
| `date_updated_gt` | `number` | Updated after timestamp (Unix milliseconds) |
| `date_updated_lt` | `number` | Updated before timestamp (Unix milliseconds) |
| `date_closed_gt` | `number` | Completed after timestamp (Unix milliseconds) |
| `date_closed_lt` | `number` | Completed before timestamp (Unix milliseconds) |
| `tags` | `string[]` | Filter by tags |
| `priority` | `number[]` | Filter by priority (1-4) |
| `space_ids` | `string[]` | Limit to specific spaces |
| `list_ids` | `string[]` | Limit to specific lists (folder/space/team only) |
| `include_closed` | `boolean` | Include closed tasks |
| `subtasks` | `boolean` | Include subtask details |
| `page` | `number` | Page number |
| `order_by` | `string` | Sort field |
| `reverse` | `boolean` | Reverse sort |

## 📄 License

MIT

## 🔗 Links

- [ClickUp API Documentation](https://clickup.com/api)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Claude MCP Documentation](https://docs.anthropic.com/claude/docs/mcp)