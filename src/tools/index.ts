import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition } from "../types.js";

// CRM
import { createLeadsTool } from "./crm/leads.js";
import { createDealsTool } from "./crm/deals.js";
import { createContactsTool } from "./crm/contacts.js";
import { createCompaniesTool } from "./crm/companies.js";
import { createInvoicesTool } from "./crm/invoices.js";
import { createProductsTool } from "./crm/products.js";
import { createActivitiesTool } from "./crm/activities.js";
import { createRequisitesTool } from "./crm/requisites.js";
import { createDuplicatesTool } from "./crm/duplicates.js";
import { createSmartProcessesTool } from "./crm/smartProcesses.js";
import { createQuotesTool } from "./crm/quotes.js";
import { createDocumentGeneratorTool } from "./crm/documentGenerator.js";
import { createCurrencyTool } from "./crm/currency.js";
import { createWebformTool } from "./crm/webform.js";
import { createTrackingTool } from "./crm/tracking.js";
import { createCrmAutomationTool } from "./crm/crmAutomation.js";
import { createCallListsTool } from "./crm/callLists.js";
import { createAddressesTool } from "./crm/addresses.js";
import { createStageHistoryTool } from "./crm/stageHistory.js";
// collab
import { createTasksTool } from "./collab/tasks.js";
import { createProjectsTool } from "./collab/projects.js";
import { createDiskTool } from "./collab/disk.js";
import { createImTool } from "./collab/im.js";
import { createImChatTool } from "./collab/imChat.js";
import { createConfTool } from "./collab/conf.js";
import { createCalendarTool } from "./collab/calendar.js";
import { createOpenLinesTool } from "./collab/openlines.js";
import { createBotsTool } from "./collab/bots.js";
// org
import { createUsersTool } from "./org/users.js";
import { createDepartmentsTool } from "./org/departments.js";
import { createTimeTool } from "./org/time.js";
import { createHrTool } from "./org/hr.js";
// biz
import { createListsTool } from "./biz/lists.js";
import { createMailTool } from "./biz/mail.js";
import { createReportsTool } from "./biz/reports.js";
import { createMarketingTool } from "./biz/marketing.js";
import { createWorkflowsTool } from "./biz/workflows.js";
import { createTelephonyTool } from "./biz/telephony.js";
import { createEventsTool } from "./biz/events.js";
// generic
import { createBatchTool } from "./batch.js";
import { createCallTool } from "./call.js";

export function getAllTools(client: Bitrix24ApiClient): ToolDefinition[] {
  return [
    // CRM (19)
    createLeadsTool(client),
    createDealsTool(client),
    createContactsTool(client),
    createCompaniesTool(client),
    createInvoicesTool(client),
    createProductsTool(client),
    createActivitiesTool(client),
    createRequisitesTool(client),
    createDuplicatesTool(client),
    createSmartProcessesTool(client),
    createQuotesTool(client),
    createDocumentGeneratorTool(client),
    createCurrencyTool(client),
    createWebformTool(client),
    createTrackingTool(client),
    createCrmAutomationTool(client),
    createCallListsTool(client),
    createAddressesTool(client),
    createStageHistoryTool(client),
    // collab (9)
    createTasksTool(client),
    createProjectsTool(client),
    createDiskTool(client),
    createImTool(client),
    createImChatTool(client),
    createConfTool(client),
    createCalendarTool(client),
    createOpenLinesTool(client),
    createBotsTool(client),
    // org (4)
    createUsersTool(client),
    createDepartmentsTool(client),
    createTimeTool(client),
    createHrTool(client),
    // biz (7)
    createListsTool(client),
    createMailTool(client),
    createReportsTool(client),
    createMarketingTool(client),
    createWorkflowsTool(client),
    createTelephonyTool(client),
    createEventsTool(client),
    // generic (2)
    createBatchTool(client),
    createCallTool(client),
  ];
}

/** Tool names that legitimately do not use the `action` parameter. */
export const NON_ACTION_TOOLS = new Set(["bx24_batch", "bx24_call"]);