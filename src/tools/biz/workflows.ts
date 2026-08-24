import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createWorkflowsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_workflows",
    `Bitrix24 business processes & robots: templates, instances, tasks, robots, activities. Methods bizproc.workflow.*, bizproc.workflow.template.*, bizproc.task.*, bizproc.robot.*, bizproc.activity.* (${API_VERSION}). RU/EN: бизнес-процесс, робот, запустить процесс, шаблон, задача БП,杀ить / workflow, business process, robot, start, template, kill.`,
    ["template_list", "template_get", "start", "kill", "task_list", "task_complete", "task_get", "robot_list", "activity_list", "activity_get", "instance_list", "instance_terminate"],
    {
      id: P.id, templateId: { type: "string", description: "Template ID" },
      documentId: { type: "array", items: { type: "string" }, description: "Document ID tuple, e.g. ['crm','DEAL',456]" },
      parameters: { type: "object", description: "Workflow parameters" },
      taskId: { type: "string", description: "BP task ID" },
      taskFields: { type: "object", description: "Task fields (answer)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      template_list: { restMethod: "bizproc.workflow.template.list", httpVerb: "GET", isList: true },
      template_get: { restMethod: "bizproc.workflow.template.get", httpVerb: "GET", pathParams: ["templateId"] },
      start: { restMethod: "bizproc.workflow.start", httpVerb: "POST", pathParams: ["templateId"], bodyParam: "documentId", bodyWrapper: "document_id" },
      kill: { restMethod: "bizproc.workflow.kill", httpVerb: "POST", pathParams: ["id"] },
      task_list: { restMethod: "bizproc.task.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      task_complete: { restMethod: "bizproc.task.complete", httpVerb: "POST", pathParams: ["taskId"], bodyParam: "taskFields", bodyWrapper: "fields" },
      task_get: { restMethod: "bizproc.task.get", httpVerb: "GET", pathParams: ["taskId"] },
      robot_list: { restMethod: "bizproc.robot.list", httpVerb: "GET", isList: true },
      activity_list: { restMethod: "bizproc.activity.list", httpVerb: "GET", isList: true },
      activity_get: { restMethod: "bizproc.activity.get", httpVerb: "GET", pathParams: ["id"] },
      instance_list: { restMethod: "bizproc.workflow.instances.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      instance_terminate: { restMethod: "bizproc.workflow.kill", httpVerb: "POST", pathParams: ["id"] },
    },
    client,
    {
      template_list: "List workflow templates", template_get: "Get a template by ID",
      start: "Start a workflow for a document (templateId, documentId)", kill: "Kill a running workflow (destructive)",
      task_list: "List workflow tasks (approvals)", task_complete: "Complete a workflow task",
      task_get: "Get a workflow task by ID",
      robot_list: "List robots", activity_list: "List activities", activity_get: "Get an activity",
      instance_list: "List running workflow instances", instance_terminate: "Terminate a workflow instance (destructive)",
    },
  );
}