// Reusable JSON-schema fragments for Bitrix24 tool parameters.
// Bitrix24 entity IDs are returned as strings (often numeric). Keep them as
// strings to match the wire format and avoid precision loss on large IDs.
export const P = {
  // CRM entities
  leadId: { type: "string", description: "Lead ID (CRM)" },
  contactId: { type: "string", description: "Contact ID (CRM)" },
  companyId: { type: "string", description: "Company ID (CRM)" },
  dealId: { type: "string", description: "Deal ID (CRM)" },
  activityId: { type: "string", description: "Activity/deal ID (CRM)" },
  productId: { type: "string", description: "Product ID (CRM catalog)" },
  ownerId: { type: "string", description: "Owner entity ID (e.g. lead/contact/company/deal ID)" },
  ownerType: { type: "string", enum: ["lead", "contact", "company", "deal"], description: "Owner entity type for CRM userfield" },
  userfieldId: { type: "string", description: "CRM userfield ID (e.g. UF_CRM_123)" },
  enumId: { type: "string", description: "Userfield enum value ID" },

  // Tasks
  taskId: { type: "string", description: "Task ID" },
  checklistItemId: { type: "string", description: "Checklist item ID" },
  taskFields: { type: "object", description: "Task fields: TITLE (required), DESCRIPTION, RESPONSIBLE_ID, DEADLINE, GROUP_ID, PRIORITY, STATUS, etc." },

  // IM / chats
  chatId: { type: "string", description: "Chat ID (e.g. chat123)" },
  dialogId: { type: "string", description: "Dialog ID: 'chatNNN' for chats or numeric user ID for private dialogs" },
  messageId: { type: "string", description: "Message ID" },
  userId: { type: "string", description: "User ID (numeric)" },
  chatTitle: { type: "string", description: "Chat title/name" },
  message: { type: "string", description: "Message text content" },
  userList: { type: "array", items: { type: "string" }, description: "Array of user IDs" },

  // Disk (files/folders)
  fileId: { type: "string", description: "File ID (Disk)" },
  folderId: { type: "string", description: "Folder ID (Disk)" },
  fileName: { type: "string", description: "File name" },
  fileContent: { type: "string", description: "File content (base64-encoded)" },

  // Calendar
  eventId: { type: "string", description: "Calendar event ID" },
  calendarType: { type: "string", enum: ["user", "calendar"], description: "Calendar type: 'user' (personal) or 'calendar' (shared)" },
  calendarId: { type: "string", description: "Calendar ID (owner calendar)" },

  // Generic
  id: { type: "string", description: "Entity ID" },
  fields: { type: "object", description: "Entity fields object (per Bitrix24 docs for the method)" },
  filter: { type: "object", description: "Filter object (e.g. { '>OPPORTUNITY': 10000, 'STAGE_ID': 'WON' })" },
  select: { type: "array", items: { type: "string" }, description: "Array of field names to return (projection)" },
  order: { type: "object", description: "Order object (e.g. { 'ID': 'DESC' })" },
  start: { type: "integer", minimum: 0, description: "Pagination offset (number of records to skip)" },
  limit: { type: "integer", minimum: 1, description: "Maximum number of results (server may cap, e.g. 50)" },
  name: { type: "string", description: "Name/title" },
  title: { type: "string", description: "Title" },
  query: { type: "string", description: "Search query" },
  active: { type: "boolean", description: "Active flag" },
  params: { type: "object", description: "Additional method-specific params object" },

  // batch / generic call
  cmd: { type: "object", description: "Batch commands: { key: 'rest.method?param=value', ... }. Reference earlier results via $result[key]." },
  halt: { type: "boolean", description: "If true, batch stops on first error" },
  restMethod: { type: "string", description: "Bitrix24 REST method name (e.g. 'crm.lead.list')" },
};