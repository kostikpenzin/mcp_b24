import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createProductsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_products",
    `Bitrix24 catalog: products, sections, prices, stores, product rows. Methods catalog.product.*, catalog.section.*, catalog.price.*, catalog.store.*, crm.item.productrow.* (${API_VERSION}). RU/EN: товар, продукт, раздел, цена, склад, товарная позиция / product, section, price, store, product row.`,
    ["product_add", "product_get", "product_list", "product_update", "product_delete", "product_fields", "section_list", "section_add", "section_get", "section_delete", "price_add", "price_list", "price_update", "store_list", "store_get", "productrow_add", "productrow_get", "productrow_list"],
    {
      id: P.id, fields: { type: "object", description: "Product fields: NAME, PRICE, CURRENCY_ID, VAT_ID, MEASURE, DESCRIPTION, SECTION_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      sectionFields: { type: "object", description: "Section fields: NAME, IBLOCK_ID" },
      priceFields: { type: "object", description: "Price: {PRODUCT_ID, PRICE, CURRENCY}" },
      rowFields: { type: "object", description: "Product row: {PRODUCT_ID, PRICE, QUANTITY, OWNER_TYPE, OWNER_ID}" },
    },
    {
      product_add: { restMethod: "catalog.product.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      product_get: { restMethod: "catalog.product.get", httpVerb: "GET", pathParams: ["id"] },
      product_list: { restMethod: "catalog.product.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      product_update: { restMethod: "catalog.product.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      product_delete: { restMethod: "catalog.product.delete", httpVerb: "POST", pathParams: ["id"] },
      product_fields: { restMethod: "catalog.product.fields", httpVerb: "GET" },
      section_list: { restMethod: "catalog.section.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      section_add: { restMethod: "catalog.section.add", httpVerb: "POST", bodyParam: "sectionFields", bodyWrapper: "fields" },
      section_get: { restMethod: "catalog.section.get", httpVerb: "GET", pathParams: ["id"] },
      section_delete: { restMethod: "catalog.section.delete", httpVerb: "POST", pathParams: ["id"] },
      price_add: { restMethod: "catalog.price.add", httpVerb: "POST", bodyParam: "priceFields", bodyWrapper: "fields" },
      price_list: { restMethod: "catalog.price.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      price_update: { restMethod: "catalog.price.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "priceFields", bodyWrapper: "fields" },
      store_list: { restMethod: "catalog.store.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      store_get: { restMethod: "catalog.store.get", httpVerb: "GET", pathParams: ["id"] },
      productrow_add: { restMethod: "crm.item.productrow.add", httpVerb: "POST", bodyParam: "rowFields", bodyWrapper: "fields" },
      productrow_get: { restMethod: "crm.item.productrow.get", httpVerb: "GET", pathParams: ["id"] },
      productrow_list: { restMethod: "crm.item.productrow.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
    },
    client,
    {
      product_add: "Create a product (NAME required)", product_get: "Get a product by ID", product_list: "List products",
      product_update: "Update product fields", product_delete: "Delete a product (destructive)", product_fields: "Describe product fields",
      section_list: "List catalog sections", section_add: "Create a section", section_get: "Get a section", section_delete: "Delete a section (destructive)",
      price_add: "Add a price", price_list: "List prices", price_update: "Update a price",
      store_list: "List stores", store_get: "Get a store",
      productrow_add: "Add a product row to an entity", productrow_get: "Get a product row by ID", productrow_list: "List product rows",
    },
  );
}