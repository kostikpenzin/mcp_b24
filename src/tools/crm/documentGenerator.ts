import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDocumentGeneratorTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_documents",
    `Bitrix24 CRM document generator (генератор документов): templates, documents, numerators, bindings, providers. Methods crm.documentgenerator.* (${API_VERSION}). RU/EN: документ, шаблон документа, счёт, договор, нумератор / document, document template, invoice, contract, numerator.`,
    [
      "template_list", "template_get", "template_add", "template_update", "template_delete", "template_fields",
      "document_add", "document_get", "document_list", "document_delete", "document_fields", "document_enable", "document_disable",
      "binding_add", "binding_list", "binding_get", "binding_delete", "binding_fields",
      "numerator_add", "numerator_get", "numerator_list", "numerator_update", "numerator_delete",
      "region_list", "provider_list",
    ],
    {
      id: P.templateId,
      documentId: P.documentId,
      numeratorId: P.numeratorId,
      templateId: P.templateId,
      fields: { type: "object", description: "Template/document/numerator fields (per Bitrix24 docs for the method)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      entityType: { type: "string", description: "Entity type for binding (e.g. crm_deal, crm_lead)" },
      entityId: { type: "string", description: "Entity ID for document generation" },
      token: { type: "string", description: "Document access token (for document_get/delete)" },
    },
    {
      template_list: { restMethod: "crm.documentgenerator.template.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      template_get: { restMethod: "crm.documentgenerator.template.get", httpVerb: "GET", pathParams: ["id"] },
      template_add: { restMethod: "crm.documentgenerator.template.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      template_update: { restMethod: "crm.documentgenerator.template.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      template_delete: { restMethod: "crm.documentgenerator.template.delete", httpVerb: "POST", pathParams: ["id"] },
      template_fields: { restMethod: "crm.documentgenerator.template.fields", httpVerb: "GET" },
      document_add: { restMethod: "crm.documentgenerator.document.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      document_get: { restMethod: "crm.documentgenerator.document.get", httpVerb: "GET", pathParams: ["documentId", "token"] },
      document_list: { restMethod: "crm.documentgenerator.document.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      document_delete: { restMethod: "crm.documentgenerator.document.delete", httpVerb: "POST", pathParams: ["documentId", "token"] },
      document_fields: { restMethod: "crm.documentgenerator.document.fields", httpVerb: "GET" },
      document_enable: { restMethod: "crm.documentgenerator.document.enable", httpVerb: "POST", pathParams: ["documentId"] },
      document_disable: { restMethod: "crm.documentgenerator.document.disable", httpVerb: "POST", pathParams: ["documentId"] },
      binding_add: { restMethod: "crm.documentgenerator.binding.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      binding_list: { restMethod: "crm.documentgenerator.binding.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      binding_get: { restMethod: "crm.documentgenerator.binding.get", httpVerb: "GET", pathParams: ["id"] },
      binding_delete: { restMethod: "crm.documentgenerator.binding.delete", httpVerb: "POST", pathParams: ["id"] },
      binding_fields: { restMethod: "crm.documentgenerator.binding.fields", httpVerb: "GET" },
      numerator_add: { restMethod: "crm.documentgenerator.numerator.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      numerator_get: { restMethod: "crm.documentgenerator.numerator.get", httpVerb: "GET", pathParams: ["numeratorId"] },
      numerator_list: { restMethod: "crm.documentgenerator.numerator.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      numerator_update: { restMethod: "crm.documentgenerator.numerator.update", httpVerb: "POST", pathParams: ["numeratorId"], bodyParam: "fields", bodyWrapper: "fields" },
      numerator_delete: { restMethod: "crm.documentgenerator.numerator.delete", httpVerb: "POST", pathParams: ["numeratorId"] },
      region_list: { restMethod: "crm.documentgenerator.region.list", httpVerb: "GET" },
      provider_list: { restMethod: "crm.documentgenerator.provider.list", httpVerb: "GET" },
    },
    client,
    {
      template_list: "List document templates", template_get: "Get a template by ID", template_add: "Add a document template",
      template_update: "Update a document template", template_delete: "Delete a document template (destructive)", template_fields: "Describe template fields",
      document_add: "Generate a document from a template (templateId + entityId + entityType)",
      document_get: "Get a document by ID (requires token)", document_list: "List generated documents",
      document_delete: "Delete a document (destructive, requires token)", document_fields: "Describe document fields",
      document_enable: "Enable a public document link", document_disable: "Disable a public document link",
      binding_add: "Bind a template to an entity type", binding_list: "List template bindings",
      binding_get: "Get a binding", binding_delete: "Delete a binding (destructive)", binding_fields: "Describe binding fields",
      numerator_add: "Add a document numerator (numbering template)", numerator_get: "Get a numerator",
      numerator_list: "List numerators", numerator_update: "Update a numerator", numerator_delete: "Delete a numerator (destructive)",
      region_list: "List document regions (locale)", provider_list: "List document providers (data sources)",
    },
  );
}