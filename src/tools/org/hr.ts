import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createHrTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_hr",
    `Bitrix24 HR: employees + invitations. Methods humanresources.employee.*, user.add/update (${API_VERSION}). RU/EN: сотрудник, кадры, пригласить, уволить, перевести, профиль / employee, HR, invite, dismiss, transfer, profile.`,
    ["employee_list", "employee_get", "invite", "dismiss", "transfer", "info"],
    {
      id: P.id, userId: P.userId,
      fields: { type: "object", description: "Employee/user fields: NAME, LAST_NAME, EMAIL, UF_DEPARTMENT, WORK_POSITION" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      employee_list: { restMethod: "humanresources.employee.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      employee_get: { restMethod: "humanresources.employee.get", httpVerb: "GET", pathParams: ["id"] },
      invite: { restMethod: "user.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      dismiss: { restMethod: "user.update", httpVerb: "POST", pathParams: ["userId"], bodyParam: "fields", bodyWrapper: "fields" },
      transfer: { restMethod: "user.update", httpVerb: "POST", pathParams: ["userId"], bodyParam: "fields", bodyWrapper: "fields" },
      info: { restMethod: "humanresources.employee.info", httpVerb: "GET", pathParams: ["id"] },
    },
    client,
    {
      employee_list: "List employees", employee_get: "Get an employee by ID",
      invite: "Invite a new employee (user.add)", dismiss: "Dismiss an employee (user.update to inactive) — destructive",
      transfer: "Transfer an employee (update department/position)", info: "Get HR info for an employee",
    },
  );
}