import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createWorkflowsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_workflows",
    `Bitrix24 business processes & robots: templates, instances, tasks, robots, activities. Methods bizproc.workflow.*, bizproc.workflow.template.*, bizproc.task.*, bizproc.robot.*, bizproc.activity.* (${API_VERSION}). RU/EN: бизнес-процесс, робот, запустить процесс, шаблон, задача БП,杀ить / workflow, business process, robot, start, template, kill.`,
    ["template_list", "template_get", "template_add", "template_update", "template_delete", "start", "kill", "workflow_terminate", "task_list", "task_complete", "task_get", "task_delegate", "robot_list", "robot_add", "robot_update", "robot_delete", "activity_list", "activity_get", "activity_add", "activity_update", "activity_delete", "activity_log", "event_send", "instance_list", "instance_terminate"],
    {
      id: P.id, templateId: { type: "string", description: "Template ID" },
      documentId: { type: "array", items: { type: "string" }, description: "Document ID tuple, e.g. ['crm','DEAL',456]" },
      parameters: { type: "object", description: "Workflow parameters" },
      taskId: { type: "string", description: "BP task ID" },
      taskFields: { type: "object", description: "Task fields (answer)" },
      robotFields: { type: "object", description: "Robot fields: CODE, NAME, ..." },
      activityFields: { type: "object", description: "Activity fields: CODE, NAME, ..." },
      logFields: { type: "object", description: "Log message fields" },
      eventFields: { type: "object", description: "Event fields for bizproc.event.send" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      template_list: { restMethod: "bizproc.workflow.template.list", httpVerb: "GET", isList: true },
      template_get: { restMethod: "bizproc.workflow.template.get", httpVerb: "GET", pathParams: ["templateId"] },
      template_add: { restMethod: "bizproc.workflow.template.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      template_update: { restMethod: "bizproc.workflow.template.update", httpVerb: "POST", pathParams: ["templateId"], bodyParam: "fields", bodyWrapper: "fields" },
      template_delete: { restMethod: "bizproc.workflow.template.delete", httpVerb: "POST", pathParams: ["templateId"] },
      start: { restMethod: "bizproc.workflow.start", httpVerb: "POST", pathParams: ["templateId"], bodyParam: "documentId", bodyWrapper: "document_id" },
      kill: { restMethod: "bizproc.workflow.kill", httpVerb: "POST", pathParams: ["id"] },
      workflow_terminate: { restMethod: "bizproc.workflow.terminate", httpVerb: "POST", pathParams: ["id"] },
      task_list: { restMethod: "bizproc.task.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      task_complete: { restMethod: "bizproc.task.complete", httpVerb: "POST", pathParams: ["taskId"], bodyParam: "taskFields", bodyWrapper: "fields" },
      task_get: { restMethod: "bizproc.task.get", httpVerb: "GET", pathParams: ["taskId"] },
      task_delegate: { restMethod: "bizproc.task.delegate", httpVerb: "POST", pathParams: ["taskId"], bodyParam: "taskFields", bodyWrapper: "fields" },
      robot_list: { restMethod: "bizproc.robot.list", httpVerb: "GET", isList: true },
      robot_add: { restMethod: "bizproc.robot.add", httpVerb: "POST", bodyParam: "robotFields", bodyWrapper: "fields" },
      robot_update: { restMethod: "bizproc.robot.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "robotFields", bodyWrapper: "fields" },
      robot_delete: { restMethod: "bizproc.robot.delete", httpVerb: "POST", pathParams: ["id"] },
      activity_list: { restMethod: "bizproc.activity.list", httpVerb: "GET", isList: true },
      activity_get: { restMethod: "bizproc.activity.get", httpVerb: "GET", pathParams: ["id"] },
      activity_add: { restMethod: "bizproc.activity.add", httpVerb: "POST", bodyParam: "activityFields", bodyWrapper: "fields" },
      activity_update: { restMethod: "bizproc.activity.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "activityFields", bodyWrapper: "fields" },
      activity_delete: { restMethod: "bizproc.activity.delete", httpVerb: "POST", pathParams: ["id"] },
      activity_log: { restMethod: "bizproc.activity.log", httpVerb: "POST", bodyParam: "logFields", bodyWrapper: "fields" },
      event_send: { restMethod: "bizproc.event.send", httpVerb: "POST", bodyParam: "eventFields", bodyWrapper: "fields" },
      instance_list: { restMethod: "bizproc.workflow.instances.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      instance_terminate: { restMethod: "bizproc.workflow.kill", httpVerb: "POST", pathParams: ["id"] },
    },
    client,
    {
      template_list: "List workflow templates", template_get: "Get a template by ID",
      template_add: "Add a workflow template", template_update: "Update a workflow template", template_delete: "Delete a workflow template (destructive)",
      start: "Start a workflow for a document (templateId, documentId)", kill: "Kill a running workflow (destructive)",
      workflow_terminate: "Terminate a workflow execution (graceful stop, destructive)",
      task_list: "List workflow tasks (approvals)", task_complete: "Complete a workflow task",
      task_get: "Get a workflow task by ID", task_delegate: "Delegate a workflow task to a user",
      robot_list: "List robots", robot_add: "Register an app robot", robot_update: "Update an app robot", robot_delete: "Delete an app robot (destructive)",
      activity_list: "List activities", activity_get: "Get an activity",
      activity_add: "Add an app activity", activity_update: "Update an app activity", activity_delete: "Delete an app activity (destructive)",
      activity_log: "Write a message to the workflow log",
      event_send: "Send robot/activity outputs to the workflow (bizproc.event.send)",
      instance_list: "List running workflow instances", instance_terminate: "Terminate a workflow instance (destructive)",
    },
  );
}