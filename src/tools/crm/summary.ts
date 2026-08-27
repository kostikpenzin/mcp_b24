import type { Bitrix24ApiClient } from "../../api-client.js";
import type { Bitrix24Response } from "../../types.js";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { errorResult, successResult } from "../../error.js";
import { API_VERSION } from "../../constants.js";

interface StatusItem {
  STATUS_ID: string;
  NAME: string;
}

interface CategoryItem {
  ID: string;
  NAME: string;
}

interface CrmSummary {
  totalLeads: number;
  totalDeals: number;
  totalContacts: number;
  totalCompanies: number;
  leadStatuses: StatusItem[];
  dealCategories: CategoryItem[];
}

// Fetch CRM entity counts and reference data in parallel so the LLM gets a
// portal overview in a single tool call instead of 5–7 separate ones.
export function createCrmSummaryTool(client: Bitrix24ApiClient): ToolDefinition {
  return {
    name: "bx24_crm_summary",
    description: `Bitrix24 CRM summary: total counts of leads, deals, contacts, companies plus lead statuses and deal categories (funnels) in one call (${API_VERSION}). RU/EN: сводка CRM, сколько лидов/сделок/контактов/компаний, обзор CRM, статусы лидов, воронки / CRM summary, how many leads/deals/contacts/companies, lead statuses, deal funnels.`,
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async (): Promise<ToolResult> => {
      try {
        const [leadsRes, dealsRes, contactsRes, companiesRes, statusesRes, categoriesRes] =
          await Promise.all([
            client.callMethod<Bitrix24Response>("crm.lead.list", { select: ["ID"], start: 0 }),
            client.callMethod<Bitrix24Response>("crm.deal.list", { select: ["ID"], start: 0 }),
            client.callMethod<Bitrix24Response>("crm.contact.list", { select: ["ID"], start: 0 }),
            client.callMethod<Bitrix24Response>("crm.company.list", { select: ["ID"], start: 0 }),
            client.callMethod<Bitrix24Response>("crm.status.list", { filter: { ENTITY_ID: "STATUS" } }),
            client.callMethod<Bitrix24Response>("crm.dealcategory.list", {}),
          ]);

        const leadStatuses: StatusItem[] = Array.isArray(statusesRes.result)
          ? (statusesRes.result as Record<string, unknown>[]).map((s) => ({
              STATUS_ID: String(s.STATUS_ID ?? ""),
              NAME: String(s.NAME ?? ""),
            }))
          : [];

        const dealCategories: CategoryItem[] = Array.isArray(categoriesRes.result)
          ? (categoriesRes.result as Record<string, unknown>[]).map((c) => ({
              ID: String(c.ID ?? ""),
              NAME: String(c.NAME ?? ""),
            }))
          : [];

        const summary: CrmSummary = {
          totalLeads: leadsRes.total ?? 0,
          totalDeals: dealsRes.total ?? 0,
          totalContacts: contactsRes.total ?? 0,
          totalCompanies: companiesRes.total ?? 0,
          leadStatuses,
          dealCategories,
        };

        return successResult(summary);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult(`Failed to fetch CRM summary: ${message}`);
      }
    },
  };
}