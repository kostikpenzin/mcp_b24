import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createListsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_lists",
    `Bitrix24 universal lists (infoblocks): lists, fields, elements, sections. Methods lists.*, lists.element.*, lists.field.*, lists.section.* (${API_VERSION}). RU/EN: универсальный список, инфоблок, элемент списка, поле / universal list, list element, field, section.`,
    ["list_add", "list_get", "list_update", "list_delete", "list_get_iblock_type_id", "field_get", "field_add", "field_update", "field_delete", "field_type_get", "element_get", "element_list", "element_add", "element_update", "element_delete", "element_get_file_url", "section_list", "section_add", "section_update", "section_delete"],
    {
      id: P.id, IBLOCK_TYPE_ID: { type: "string", description: "Info-block type id (lists)" },
      IBLOCK_ID: { type: "string", description: "List (info-block) ID" },
      ELEMENT_ID: { type: "string", description: "Element ID" },
      SECTION_ID: { type: "string", description: "Section ID" },
      fields: { type: "object", description: "List/element/field/section fields" },
      fieldId: P.userfieldId,
      fieldType: { type: "string", description: "Field type code (for field_type_get)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      list_add: { restMethod: "lists.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      list_get: { restMethod: "lists.get", httpVerb: "GET", pathParams: ["IBLOCK_ID"] },
      list_update: { restMethod: "lists.update", httpVerb: "POST", pathParams: ["IBLOCK_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      list_delete: { restMethod: "lists.delete", httpVerb: "POST", pathParams: ["IBLOCK_ID"] },
      list_get_iblock_type_id: { restMethod: "lists.get.iblock.type.id", httpVerb: "GET" },
      field_get: { restMethod: "lists.field.get", httpVerb: "GET", pathParams: ["IBLOCK_ID", "fieldId"] },
      field_add: { restMethod: "lists.field.add", httpVerb: "POST", pathParams: ["IBLOCK_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      field_update: { restMethod: "lists.field.update", httpVerb: "POST", pathParams: ["IBLOCK_ID", "fieldId"], bodyParam: "fields", bodyWrapper: "fields" },
      field_delete: { restMethod: "lists.field.delete", httpVerb: "POST", pathParams: ["IBLOCK_ID", "fieldId"] },
      field_type_get: { restMethod: "lists.field.type.get", httpVerb: "GET", pathParams: ["fieldType"] },
      element_get: { restMethod: "lists.element.get", httpVerb: "GET", pathParams: ["IBLOCK_ID", "ELEMENT_ID"] },
      element_list: { restMethod: "lists.element.get", httpVerb: "GET", isList: true, pathParams: ["IBLOCK_ID"], queryParams: ["filter", "select", "order", "start"] },
      element_add: { restMethod: "lists.element.add", httpVerb: "POST", pathParams: ["IBLOCK_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      element_update: { restMethod: "lists.element.update", httpVerb: "POST", pathParams: ["IBLOCK_ID", "ELEMENT_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      element_delete: { restMethod: "lists.element.delete", httpVerb: "POST", pathParams: ["IBLOCK_ID", "ELEMENT_ID"] },
      element_get_file_url: { restMethod: "lists.element.get.file.url", httpVerb: "GET", pathParams: ["IBLOCK_ID", "ELEMENT_ID"], queryParams: ["fieldId"] },
      section_list: { restMethod: "lists.section.get", httpVerb: "GET", isList: true, pathParams: ["IBLOCK_ID"], queryParams: ["filter"] },
      section_add: { restMethod: "lists.section.add", httpVerb: "POST", pathParams: ["IBLOCK_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      section_update: { restMethod: "lists.section.update", httpVerb: "POST", pathParams: ["IBLOCK_ID", "SECTION_ID"], bodyParam: "fields", bodyWrapper: "fields" },
      section_delete: { restMethod: "lists.section.delete", httpVerb: "POST", pathParams: ["IBLOCK_ID", "SECTION_ID"] },
    },
    client,
    {
      list_add: "Create a list", list_get: "Get list metadata", list_update: "Update a list", list_delete: "Delete a list (destructive)",
      list_get_iblock_type_id: "Get the info-block type ID for lists",
      field_get: "Get a list field", field_add: "Add a list field", field_update: "Update a list field", field_delete: "Delete a list field (destructive)",
      field_type_get: "Get available list field types",
      element_get: "Get a list element", element_list: "List elements", element_add: "Add an element",
      element_update: "Update an element", element_delete: "Delete an element (destructive)",
      element_get_file_url: "Get the file URL of an element field",
      section_list: "List list sections", section_add: "Add a list section", section_update: "Update a list section", section_delete: "Delete a list section (destructive)",
    },
  );
}