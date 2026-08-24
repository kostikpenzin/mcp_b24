import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createProjectsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_projects",
    `Bitrix24 groups/projects (соц. сеть): CRUD, members, owner, features. Methods sonet_group.*, socialnetwork.group.*, socialnetwork.project.* (${API_VERSION}). RU/EN: проект, группа, рабочая группа, создать проект, участники / project, group, create project, members.`,
    ["create", "get", "list", "update", "delete", "user_list", "user_add", "user_invite", "user_update", "user_delete", "set_owner", "feature_set", "feature_get", "request_list", "subject_add", "subject_update", "subject_delete"],
    {
      id: P.id, fields: { type: "object", description: "Group fields: NAME, DESCRIPTION, VISIBLE, OPENED, PROJECT, KEYWORDS, SUBJECT_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      userId: P.userId, featureId: { type: "string", description: "Feature name (e.g. tasks, files, forum)" },
      featureEnabled: { type: "boolean", description: "Enable/disable the feature" },
      role: { type: "string", description: "Member role for user_update (e.g. E, K, M)" },
      subjectId: { type: "string", description: "Group subject/topic ID" },
      subjectFields: { type: "object", description: "Subject fields: NAME" },
    },
    {
      create: { restMethod: "sonet_group.create", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "sonet_group.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "sonet_group.get", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "sonet_group.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "sonet_group.delete", httpVerb: "POST", pathParams: ["id"] },
      user_list: { restMethod: "socialnetwork.api.workgroup.user.list", httpVerb: "GET", pathParams: ["id"] },
      user_add: { restMethod: "sonet_group.user.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "userId", bodyWrapper: "userId" },
      user_invite: { restMethod: "sonet_group.user.invite", httpVerb: "POST", pathParams: ["id"], bodyParam: "userId", bodyWrapper: "userId" },
      user_update: { restMethod: "sonet_group.user.update", httpVerb: "POST", pathParams: ["id", "userId"], bodyParam: "role", bodyWrapper: "role" },
      user_delete: { restMethod: "sonet_group.user.delete", httpVerb: "POST", pathParams: ["id", "userId"] },
      set_owner: { restMethod: "sonet_group.setowner", httpVerb: "POST", pathParams: ["id"], bodyParam: "userId", bodyWrapper: "userId" },
      feature_set: { restMethod: "socialnetwork.api.workgroup.feature.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "featureId", bodyWrapper: "fields" },
      feature_get: { restMethod: "socialnetwork.api.workgroup.feature.get", httpVerb: "GET", pathParams: ["id"] },
      request_list: { restMethod: "socialnetwork.api.request.list", httpVerb: "GET", queryParams: ["filter"] },
      subject_add: { restMethod: "sonet_group.subject.add", httpVerb: "POST", bodyParam: "subjectFields", bodyWrapper: "fields" },
      subject_update: { restMethod: "sonet_group.subject.update", httpVerb: "POST", pathParams: ["subjectId"], bodyParam: "subjectFields", bodyWrapper: "fields" },
      subject_delete: { restMethod: "sonet_group.subject.delete", httpVerb: "POST", pathParams: ["subjectId"] },
    },
    client,
    {
      create: "Create a group/project", get: "Get a group by ID", list: "List/filter groups",
      update: "Update a group", delete: "Delete a group (destructive)",
      user_list: "List group members", user_add: "Add a member", user_invite: "Invite a user to a group",
      user_update: "Update a member role", user_delete: "Remove a member (destructive)",
      set_owner: "Set a new group owner", feature_set: "Enable/disable a group feature (tasks/files/forum)",
      feature_get: "Get group feature states", request_list: "List membership requests",
      subject_add: "Add a group topic/subject", subject_update: "Update a group topic", subject_delete: "Delete a group topic (destructive)",
    },
  );
}