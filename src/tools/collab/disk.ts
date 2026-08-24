import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDiskTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_disk",
    `Bitrix24 Disk: storages, folders, files, versions, external links. Methods disk.storage.*, disk.folder.*, disk.file.*, disk.version.*, disk.rights.* (${API_VERSION}). RU/EN: файл, папка, диск, загрузить файл, скачать, содержимое папки, версия, публичная ссылка / file, folder, disk, upload, download, version, external link.`,
    ["storage_list", "storage_get", "storage_addFolder", "folder_addSubFolder", "folder_getChildren", "folder_copyTo", "folder_moveTo", "folder_rename", "folder_deleteTree", "folder_getExternalLink", "file_upload", "file_get", "file_search", "file_copyTo", "file_moveTo", "file_rename", "file_delete", "file_markDeleted", "file_restore", "file_getVersions", "file_uploadVersion", "file_getExternalLink"],
    {
      id: P.id, targetFolderId: { type: "string", description: "Target folder ID for copy/move" },
      storageId: { type: "string", description: "Storage ID" },
      folderFields: { type: "object", description: "Folder fields: NAME" },
      fileFields: { type: "object", description: "File fields: NAME, CONTENT (base64)" },
      fileArray: { type: "array", items: { type: "object" }, description: "Files: [{NAME, CONTENT base64}]" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      storage_list: { restMethod: "disk.storage.list", httpVerb: "GET", isList: true },
      storage_get: { restMethod: "disk.storage.get", httpVerb: "GET", pathParams: ["id"] },
      storage_addFolder: { restMethod: "disk.storage.addfolder", httpVerb: "POST", pathParams: ["id"], bodyParam: "folderFields", bodyWrapper: "fields" },
      folder_addSubFolder: { restMethod: "disk.folder.addsubfolder", httpVerb: "POST", pathParams: ["id"], bodyParam: "folderFields", bodyWrapper: "fields" },
      folder_getChildren: { restMethod: "disk.folder.getchildren", httpVerb: "GET", isList: true, pathParams: ["id"], queryParams: ["filter", "select", "order", "start"] },
      folder_copyTo: { restMethod: "disk.folder.copyto", httpVerb: "POST", pathParams: ["id"], bodyParam: "targetFolderId", bodyWrapper: "targetFolderId" },
      folder_moveTo: { restMethod: "disk.folder.moveto", httpVerb: "POST", pathParams: ["id"], bodyParam: "targetFolderId", bodyWrapper: "targetFolderId" },
      folder_rename: { restMethod: "disk.folder.rename", httpVerb: "POST", pathParams: ["id"], bodyParam: "folderFields", bodyWrapper: "fields" },
      folder_deleteTree: { restMethod: "disk.folder.deletetree", httpVerb: "POST", pathParams: ["id"] },
      folder_getExternalLink: { restMethod: "disk.folder.getexternalLink", httpVerb: "GET", pathParams: ["id"] },
      file_upload: { restMethod: "disk.folder.uploadfile", httpVerb: "POST", pathParams: ["id"], bodyParam: "fileArray", bodyWrapper: "file" },
      file_get: { restMethod: "disk.file.get", httpVerb: "POST", pathParams: ["id"] },
      file_search: { restMethod: "disk.file.search", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order"] },
      file_copyTo: { restMethod: "disk.file.copyto", httpVerb: "POST", pathParams: ["id"], bodyParam: "targetFolderId", bodyWrapper: "targetFolderId" },
      file_moveTo: { restMethod: "disk.file.moveto", httpVerb: "POST", pathParams: ["id"], bodyParam: "targetFolderId", bodyWrapper: "targetFolderId" },
      file_rename: { restMethod: "disk.file.rename", httpVerb: "POST", pathParams: ["id"], bodyParam: "fileFields", bodyWrapper: "fields" },
      file_delete: { restMethod: "disk.file.delete", httpVerb: "POST", pathParams: ["id"] },
      file_markDeleted: { restMethod: "disk.file.markdeleted", httpVerb: "POST", pathParams: ["id"] },
      file_restore: { restMethod: "disk.file.restore", httpVerb: "POST", pathParams: ["id"] },
      file_getVersions: { restMethod: "disk.version.get", httpVerb: "GET", isList: true, pathParams: ["id"] },
      file_uploadVersion: { restMethod: "disk.file.uploadversion", httpVerb: "POST", pathParams: ["id"], bodyParam: "fileFields", bodyWrapper: "file" },
      file_getExternalLink: { restMethod: "disk.file.getexternalLink", httpVerb: "GET", pathParams: ["id"] },
    },
    client,
    {
      storage_list: "List available storages", storage_get: "Get a storage by ID", storage_addFolder: "Create a folder in a storage root",
      folder_addSubFolder: "Create a subfolder", folder_getChildren: "List children of a folder",
      folder_copyTo: "Copy a folder", folder_moveTo: "Move a folder", folder_rename: "Rename a folder",
      folder_deleteTree: "Delete a folder tree (destructive)", folder_getExternalLink: "Get a public link to a folder",
      file_upload: "Upload a file into a folder (file=[{NAME, CONTENT base64}])", file_get: "Get file metadata",
      file_search: "Search files", file_copyTo: "Copy a file", file_moveTo: "Move a file", file_rename: "Rename a file",
      file_delete: "Delete a file (destructive)", file_markDeleted: "Mark a file deleted (destructive)", file_restore: "Restore a deleted file",
      file_getVersions: "List file versions", file_uploadVersion: "Upload a new version of a file", file_getExternalLink: "Get a public link to a file",
    },
  );
}