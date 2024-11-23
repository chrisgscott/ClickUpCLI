Get Tasks
View the tasks in a List. Responses are limited to 100 tasks per page. You can only view task information of tasks you can access.

This endpoint only includes tasks where the specified list_id is their home List. Tasks added to the list_id with a different home List are not included in the response.

Security
Authorization_Token
Request
path Parameters
list_id
required
number <double>
To find the list_id:
1. In the Sidebar, hover over the List and click the ellipsis ... menu.
2. Select Copy link.
3. Use the copied URL to find the list_id. The list_id is the number that follows /li in the URL.

query Parameters
archived	
boolean
include_markdown_description	
boolean
To return task descriptions in Markdown format, use ?include_markdown_description=true.

page	
integer <int32>
Page to fetch (starts at 0).

order_by	
string
Order by a particular field. By default, tasks are ordered by created.

Options include: id, created, updated, and due_date.

reverse	
boolean
Tasks are displayed in reverse order.

subtasks	
boolean
Include or exclude subtasks. By default, subtasks are excluded.

statuses	
Array of strings
Filter by statuses. To include closed tasks, use the include_closed parameter.

For example:

?statuses[]=to%20do&statuses[]=in%20progress

include_closed	
boolean
Include or excluse closed tasks. By default, they are excluded.

To include closed tasks, use include_closed: true.

assignees	
Array of strings
Filter by Assignees. For example:

?assignees[]=1234&assignees[]=5678

watchers	
Array of strings
Filter by watchers.

tags	
Array of strings
Filter by tags. For example:

?tags[]=tag1&tags[]=this%20tag

due_date_gt	
integer <int32>
Filter by due date greater than Unix time in milliseconds.

due_date_lt	
integer <int32>
Filter by due date less than Unix time in milliseconds.

date_created_gt	
integer <int32>
Filter by date created greater than Unix time in milliseconds.

date_created_lt	
integer <int32>
Filter by date created less than Unix time in milliseconds.

date_updated_gt	
integer <int32>
Filter by date updated greater than Unix time in milliseconds.

date_updated_lt	
integer <int32>
Filter by date updated less than Unix time in milliseconds.

date_done_gt	
integer <int32>
Filter by date done greater than Unix time in milliseconds.

date_done_lt	
integer <int32>
Filter by date done less than Unix time in milliseconds.

custom_fields	
Array of strings
Include tasks with specific values in one or more Custom Fields. Custom Relationships are included.

For example: ?custom_fields=[{"field_id":"abcdefghi12345678","operator":"=","value":"1234"},{"field_id":"jklmnop123456","operator":"<","value":"5"}]

Only set Custom Field values display in the value property of the custom_fields parameter. If you want to include tasks with specific values in only one Custom Field, use custom_field instead.

Learn more about filtering using Custom Fields.

custom_field	
Array of strings
Include tasks with specific values in only one Custom Field. This Custom Field can be a Custom Relationship.

custom_items	
Array of numbers
Filter by custom task types. For example:

?custom_items[]=0&custom_items[]=1300

Including 0 returns tasks. Including 1 returns Milestones. Including any other number returns the custom task type as defined in your Workspace.

Responses
200
get
/v2/list/{list_id}/task
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({
    archived: 'false',
    include_markdown_description: 'true',
    page: '0',
    order_by: 'string',
    reverse: 'true',
    subtasks: 'true',
    statuses: 'string',
    include_closed: 'true',
    assignees: 'string',
    watchers: 'string',
    tags: 'string',
    due_date_gt: '0',
    due_date_lt: '0',
    date_created_gt: '0',
    date_created_lt: '0',
    date_updated_gt: '0',
    date_updated_lt: '0',
    date_done_gt: '0',
    date_done_lt: '0',
    custom_fields: 'string',
    custom_field: 'string',
    custom_items: '0'
  }).toString();

  const listId = 'YOUR_list_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"tasks": [
{},
{}
]
}


Create Task
Create a new task.

Security
Authorization_Token
Request
path Parameters
list_id
required
number <double>
query Parameters
custom_task_ids	
boolean
If you want to reference a task by its custom task id, this value must be true.

team_id	
number <double>
When the custom_task_ids parameter is set to true, the Workspace ID must be provided using the team_id parameter.
For example: custom_task_ids=true&team_id=123.

Request Body schema: application/json
required
name
required
string
description	
string
assignees	
Array of integers
archived	
boolean
group_assignees	
Array of integers
tags	
Array of strings
status	
string
priority	
integer or null <int32>
due_date	
integer <int64>
due_date_time	
boolean
time_estimate	
integer <int32>
start_date	
integer <int64>
start_date_time	
boolean
points	
number
Add Sprint Points to the task.

notify_all	
boolean
If notify_all is true, notifications will be sent to everyone including the creator of the comment.

parent	
string or null
You can create a subtask by including an existing task ID.

The parent task ID you include can be a subtask, but must be in the same List specified in the path parameter.

links_to	
string or null
Include a task ID to create a linked dependency with your new task.

check_required_custom_fields	
boolean
When creating a task via API any required Custom Fields are ignored by default (false).

You can enforce required Custom Fields by including check_required_custom_fields: true.

custom_fields	
Array of objects (CustomFields6)
Filter by Custom Fields.

custom_item_id	
number
To create a task that doesn't use a custom task type, either don't include this field in the request body, or send 'null'.

To create this task as a Milestone, send a value of 1.

To use a custom task type, send the custom task type ID as defined in your Workspace, such as 2.

Responses
200
post
/v2/list/{list_id}/task
Try it
Request samples
Payload
curl
C#
JavaScript
Java

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({
    custom_task_ids: 'true',
    team_id: '123'
  }).toString();

  const listId = 'YOUR_list_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify({
        name: 'New Task Name',
        description: 'New Task Description',
        markdown_description: 'New Task Description',
        assignees: [183],
        archived: false,
        group_assignees: [
          'dd01f92f-48ca-446d-88a1-0beb0e8f5f14'
        ],
        tags: ['tag name 1'],
        status: 'Open',
        priority: 3,
        due_date: 1508369194377,
        due_date_time: false,
        time_estimate: 8640000,
        start_date: 1567780450202,
        start_date_time: false,
        points: 3,
        notify_all: true,
        parent: null,
        links_to: null,
        check_required_custom_fields: true,
        custom_fields: [
          {
            id: '0a52c486-5f05-403b-b4fd-c512ff05131c',
            value: 'This is a string of text added to a Custom Field.'
          }
        ]
      })
    }
  );

  const data = await resp.json();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "9hx",
"custom_id": null,
"custom_item_id": null,
"name": "New Task Name",
"text_content": "New Task Content",
"description": "New Task Content",
"markdown_description": "New Task Content",
"status": {
"status": "in progress",
"color": "#d3d3d3",
"orderindex": 1,
"type": "custom"
},
"orderindex": "1.00000000000000000000000000000000",
"date_created": "1567780450202",
"date_updated": "1567780450202",
"date_closed": null,
"date_done": null,
"creator": {
"id": 183,
"username": "John Doe",
"color": "#827718",
"profilePicture": "https://attachments-public.clickup.com/profilePictures/183_abc.jpg"
},
"assignees": [ ],
"archived": false,
"group_assignees": [ ],
"checklists": [ ],
"tags": [ ],
"parent": "abc1234",
"priority": null,
"due_date": null,
"start_date": null,
"points": 3,
"time_estimate": null,
"time_spent": null,
"custom_fields": [
{}
],
"list": {
"id": "123"
},
"folder": {
"id": "456"
},
"space": {
"id": "789"
},
"url": "https://app.clickup.com/t/9hx"
}


Get Task
View information about a task. You can only view task information of tasks you can access.

Tasks with attachments will return an "attachments" response.

Docs attached to a task are not returned.

Security
Authorization_Token
Request
path Parameters
task_id
required
string
query Parameters
custom_task_ids	
boolean
If you want to reference a task by its custom task id, this value must be true.

team_id	
number <double>
When the custom_task_ids parameter is set to true, the Workspace ID must be provided using the team_id parameter.
For example: custom_task_ids=true&team_id=123.

include_subtasks	
boolean
Include subtasks, default false

include_markdown_description	
boolean
To return task descriptions in Markdown format, use ?include_markdown_description=true.

custom_fields	
Array of strings
Include tasks with specific values in one or more Custom Fields. Custom Relationships are included.

For example: ?custom_fields=[{"field_id":"abcdefghi12345678","operator":"=","value":"1234"},{"field_id":"jklmnop123456","operator":"<","value":"5"}]

Only set Custom Field values display in the value property of the custom_fields parameter. If you want to include tasks with specific values in only one Custom Field, use custom_field instead.

Learn more about filtering using Custom Fields.

Responses
200
get
/v2/task/{task_id}
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({
    custom_task_ids: 'true',
    team_id: '123',
    include_subtasks: 'true',
    include_markdown_description: 'true',
    custom_fields: 'string'
  }).toString();

  const taskId = 'YOUR_task_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}?${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "string",
"custom_id": "string",
"custom_item_id": 0,
"name": "string",
"text_content": "string",
"description": "string",
"status": {
"status": "in progress",
"color": "#d3d3d3",
"orderindex": 1,
"type": "custom"
},
"orderindex": "string",
"date_created": "string",
"date_updated": "string",
"date_closed": "string",
"creator": {
"id": 183,
"username": "John Doe",
"color": "#827718",
"profilePicture": "https://attachments-public.clickup.com/profilePictures/183_abc.jpg"
},
"assignees": [
"string"
],
"watchers": [
"string"
],
"checklists": [
"string"
],
"tags": [
"string"
],
"parent": "string",
"priority": "string",
"due_date": "string",
"start_date": "string",
"points": 0,
"time_estimate": "string",
"time_spent": "string",
"custom_fields": [
{}
],
"list": {
"id": "123"
},
"folder": {
"id": "456"
},
"space": {
"id": "789"
},
"url": "string",
"markdown_description": "string",
"attachments": [
{}
]
}


Update Task
Update a task by including one or more fields in the request body.

Security
Authorization_Token
Request
path Parameters
task_id
required
string
query Parameters
custom_task_ids	
boolean
If you want to reference a task by its custom task id, this value must be true.

team_id	
number <double>
When the custom_task_ids parameter is set to true, the Workspace ID must be provided using the team_id parameter.
For example: custom_task_ids=true&team_id=123.

Request Body schema: application/json
required
Note: To update Custom Fields on a task, you must use the Set Custom Field endpoint.

custom_item_id	
number or null
To convert an item using a custom task type into a task, send 'null'.

To update this task to be a Milestone, send a value of 1.

To use a custom task type, send the custom task type ID as defined in your Workspace, such as 2.

name	
string
description	
string
To clear the task description, include Description with " ".

status	
string
priority	
integer <int32>
due_date	
integer <int64>
due_date_time	
boolean
parent	
string
You can move a subtask to another parent task by including "parent" with a valid task id.

You cannot convert a subtask to a task by setting "parent" to null.

time_estimate	
integer <int32>
start_date	
integer <int64>
start_date_time	
boolean
points	
number
Update the task's Sprint Points.

assignees	
object (Assignees)
group_assignees	
object
watchers	
object (Watchers)
archived	
boolean
Responses
200
put
/v2/task/{task_id}
Try it
Request samples
Payload
curl
C#
JavaScript
Java

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({
    custom_task_ids: 'true',
    team_id: '123'
  }).toString();

  const taskId = 'YOUR_task_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}?${query}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify({
        name: 'Updated Task Name',
        description: 'Updated Task Content',
        status: 'in progress',
        priority: 1,
        due_date: 1508369194377,
        due_date_time: false,
        parent: 'abc1234',
        time_estimate: 8640000,
        start_date: 1567780450202,
        start_date_time: false,
        points: 3,
        assignees: {add: [182], rem: [183]},
        group_assignees: {
          add: [
            'dd01f92f-48ca-446d-88a1-0beb0e8f5f14'
          ],
          rem: [
            'dd01f92f-48ca-446d-88a1-0beb0e8f5f13'
          ]
        },
        archived: false
      })
    }
  );

  const data = await resp.json();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "9hx",
"custom_id": null,
"custom_item_id": null,
"name": "Updated Task Name",
"text_content": "Updated Task Content",
"description": "Updated Task Content",
"markdown_description": "Updates Task Content",
"status": {
"status": "in progress",
"color": "#d3d3d3",
"orderindex": 1,
"type": "custom"
},
"archived": false,
"orderindex": "1.00000000000000000000000000000000",
"date_created": "1567780450202",
"date_updated": "1567780450202",
"date_closed": null,
"creator": {
"id": 183,
"username": "John Doe",
"color": "#827718",
"profilePicture": "https://attachments-public.clickup.com/profilePictures/183_abc.jpg"
},
"assignees": [ ],
"group_assignees": [ ],
"checklists": [ ],
"tags": [ ],
"parent": "abc1234",
"priority": null,
"due_date": null,
"start_date": null,
"points": 3,
"time_estimate": null,
"time_spent": null,
"custom_fields": [
{},
{},
{}
],
"list": {
"id": "123"
},
"folder": {
"id": "456"
},
"space": {
"id": "789"
},
"url": "https://app.clickup.com/t/9hx"
}


Delete Task
Delete a task from your Workspace.

Security
Authorization_Token
Request
path Parameters
task_id
required
string
query Parameters
custom_task_ids	
boolean
If you want to reference a task by its custom task id, this value must be true.

team_id	
number <double>
When the custom_task_ids parameter is set to true, the Workspace ID must be provided using the team_id parameter.
For example: custom_task_ids=true&team_id=123.

header Parameters
Content-Type
required
string
Value: "application/json"
Responses
200
delete
/v2/task/{task_id}
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({
    custom_task_ids: 'true',
    team_id: '123'
  }).toString();

  const taskId = 'YOUR_task_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}?${query}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
Copy
{ }

## Lists

Get Lists
View the Lists within a Folder.

Security
Authorization_Token
Request
path Parameters
folder_id
required
number <double>
query Parameters
archived	
boolean
Responses
200
get
/v2/folder/{folder_id}/list
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({archived: 'false'}).toString();

  const folderId = 'YOUR_folder_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/folder/${folderId}/list?${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"lists": [
{}
]
}


Create List
Add a new List to a Folder.

Security
Authorization_Token
Request
path Parameters
folder_id
required
number <double>
Request Body schema: application/json
required
name
required
string
content	
string
due_date	
integer <int64>
due_date_time	
boolean
priority	
integer <int32>
assignee	
integer <int32>
Include a user_id to assign this List.

status	
string
Status refers to the List color rather than the task Statuses available in the List.

include_markdown_description	
boolean
To return List descriptions in Markdown format, use ?include_markdown_description=true.

Responses
200
post
/v2/folder/{folder_id}/list
Try it
Request samples
Payload
curl
C#
JavaScript
Java

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const folderId = 'YOUR_folder_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/folder/${folderId}/list`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify({
        name: 'New List Name',
        content: 'New List Content',
        due_date: 1567780450202,
        due_date_time: false,
        priority: 1,
        assignee: 183,
        status: 'red'
      })
    }
  );

  const data = await resp.json();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "124",
"name": "New List Name",
"orderindex": 1,
"content": "New List Content",
"status": {
"status": "red",
"color": "#e50000",
"hide_label": true
},
"priority": {
"priority": "urgent",
"color": "#f50000"
},
"assignee": {
"id": 183,
"color": "#827718",
"username": "Jerry",
"initials": "J",
"profilePicture": "https://dev-attachments-public.clickup.com/profilePictures/profile.jpg"
},
"task_count": null,
"due_date": "1567780450202",
"due_date_time": false,
"start_date": null,
"start_date_time": null,
"folder": {
"id": "456",
"name": "Folder Name",
"hidden": false,
"access": true
},
"space": {
"id": "789",
"name": "Space Name",
"access": true
},
"statuses": [
{},
{}
],
"inbound_address": "add.task.1389.ac725f.31518a6a-05bb-4997-92a6-1dcfe2f527ca@tasks.clickup.com"
}

Get Folderless Lists
View the Lists in a Space that aren't located in a Folder.

Security
Authorization_Token
Request
path Parameters
space_id
required
number <double>
query Parameters
archived	
boolean
Responses
200
get
/v2/space/{space_id}/list
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const query = new URLSearchParams({archived: 'false'}).toString();

  const spaceId = 'YOUR_space_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/space/${spaceId}/list?${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"lists": [
{}
]
}


Create Folderless List
Add a new List in a Space.

Security
Authorization_Token
Request
path Parameters
space_id
required
number <double>
Request Body schema: application/json
required
name
required
string
content	
string
due_date	
integer <int64>
due_date_time	
boolean
priority	
integer <int32>
assignee	
integer <int32>
Include a user_id to add a List owner.

status	
string
Status refers to the List color rather than the task Statuses available in the List.

Responses
200
post
/v2/space/{space_id}/list
Try it
Request samples
Payload
curl
C#
JavaScript
Java

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const spaceId = 'YOUR_space_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/space/${spaceId}/list`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify({
        name: 'New List Name',
        content: 'New List Content',
        due_date: 1567780450202,
        due_date_time: false,
        priority: 1,
        assignee: 183,
        status: 'red'
      })
    }
  );

  const data = await resp.json();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "124",
"name": "New List Name",
"orderindex": 1,
"content": "New List Content",
"status": {
"status": "red",
"color": "#e50000",
"hide_label": true
},
"priority": {
"priority": "urgent",
"color": "#f50000"
},
"assignee": {
"id": 183,
"color": "#827718",
"username": "Jerry",
"initials": "J",
"profilePicture": "https://dev-attachments-public.clickup.com/profilePictures/profile.jpg"
},
"task_count": null,
"due_date": "1567780450202",
"due_date_time": false,
"start_date": null,
"start_date_time": null,
"folder": {
"id": "457",
"name": "hidden",
"hidden": true,
"access": true
},
"space": {
"id": "789",
"name": "Space Name",
"access": true
},
"statuses": [
{},
{}
],
"inbound_address": "add.task.1389.ac725f.31518a6a-05bb-4997-92a6-1dcfe2f527ca@tasks.clickup.com"
}


Get List
View information about a List.

Security
Authorization_Token
Request
path Parameters
list_id
required
number <double>
Responses
200
get
/v2/list/{list_id}
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const listId = 'YOUR_list_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "124",
"name": "Updated List Name",
"orderindex": 1,
"content": "Updated List Content",
"status": {
"status": "red",
"color": "#e50000",
"hide_label": true
},
"priority": {
"priority": "high",
"color": "#f50000"
},
"assignee": null,
"due_date": "1567780450202",
"due_date_time": true,
"start_date": null,
"start_date_time": null,
"folder": {
"id": "456",
"name": "Folder Name",
"hidden": false,
"access": true
},
"space": {
"id": "789",
"name": "Space Name",
"access": true
},
"inbound_address": "add.task.124.ac725f.31518a6a-05bb-4997-92a6-1dcfe2f527ca@tasks.clickup.com",
"archived": false,
"override_statuses": false,
"statuses": [
{},
{}
],
"permission_level": "create"
}


Update List
Rename a List, update the List Info description, set a due date/time, set the List's priority, set an assignee, set or remove the List color.

Security
Authorization_Token
Request
path Parameters
list_id
required
string
Request Body schema: application/json
required
name
required
string
content
required
string
due_date
required
integer <int64>
due_date_time
required
boolean
priority
required
integer <int32>
assignee
required
string
status
required
string
Status refers to the List color rather than the task Statuses available in the List.

unset_status
required
boolean
By default, this is false. To remove the List color use unset_status: true.

include_markdown_description	
boolean
To return List descriptions in Markdown format, use ?include_markdown_description=true.

Responses
200
put
/v2/list/{list_id}
Try it
Request samples
Payload
curl
C#
JavaScript
Java

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const listId = 'YOUR_list_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify({
        name: 'Updated List Name',
        content: 'Updated List Content',
        due_date: 1567780450202,
        due_date_time: true,
        priority: 2,
        assignee: 'none',
        status: 'red',
        unset_status: true
      })
    }
  );

  const data = await resp.json();
  console.log(data);
}

run();
Response samples
200
application/json
CopyExpand allCollapse all
{
"id": "124",
"name": "Updated List Name",
"orderindex": 1,
"content": "Updated List Content",
"status": {
"status": "red",
"color": "#e50000",
"hide_label": true
},
"priority": {
"priority": "high",
"color": "#f50000"
},
"assignee": null,
"task_count": null,
"due_date": "1567780450202",
"due_date_time": true,
"start_date": null,
"start_date_time": null,
"folder": {
"id": "456",
"name": "Folder Name",
"hidden": false,
"access": true
},
"space": {
"id": "789",
"name": "Space Name",
"access": true
},
"statuses": [
{},
{}
],
"inbound_address": "add.task.1389.ac725f.31518a6a-05bb-4997-92a6-1dcfe2f527ca@tasks.clickup.com"
}


Delete List
Delete a List from your Workspace.

Security
Authorization_Token
Request
path Parameters
list_id
required
number <double>
header Parameters
Content-Type
required
string
Value: "application/json"
Responses
200
delete
/v2/list/{list_id}
Try it
Request samples
curl
C#
JavaScript
Java
Java 8 with Apache

Node.js
Node.js
Copy
import fetch from 'node-fetch';

async function run() {
  const listId = 'YOUR_list_id_PARAMETER';
  const resp = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'YOUR_API_KEY_HERE'
      }
    }
  );

  const data = await resp.text();
  console.log(data);
}

run();
Response samples
200
application/json
Copy
{ }

