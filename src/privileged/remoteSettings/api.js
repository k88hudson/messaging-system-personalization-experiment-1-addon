/* eslint no-console: ["warn", { allow: ["info", "warn", "error"] }] */
/* global ExtensionAPI, XPCOMUtils, Cu */

"use strict";

ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetters(this, {
  RemoteSettings: "resource://services-settings/remote-settings.js",
});

Cu.importGlobalProperties(["fetch"]);

const allowListedCollections = [
  "cfr-ml-control",
  "cfr-ml-experiments",
  "cfr-ml-models",
];

this.remoteSettings = class extends ExtensionAPI {
  getAPI(context) {
    const { Services } = ChromeUtils.import(
      "resource://gre/modules/Services.jsm",
      {},
    );

    const { ExtensionUtils } = ChromeUtils.import(
      "resource://gre/modules/ExtensionUtils.jsm",
      {},
    );
    const { ExtensionError } = ExtensionUtils;

    return {
      privileged: {
        remoteSettings: {
          /* Triggers a synchronization at the level only for the specified collection */
          clearLocalDataAndForceSync: async function clearLocalDataAndForceSync(
            collection,
          ) {
            if (!allowListedCollections.includes(collection)) {
              throw new ExtensionError(
                `This method is not allowed for collection "${collection}"`,
              );
            }
            try {
              const client = RemoteSettings(collection);
              // Enable use of the dev server collections
              if (
                Services.prefs.getStringPref("services.settings.server") ===
                "https://kinto.dev.mozaws.net/v1"
              ) {
                client.verifySignature = false;
              }
              Services.prefs.clearUserPref(client.lastCheckTimePref);
              const kintoCol = await client.openCollection();
              await kintoCol.clear();
              await client.sync();
            } catch (error) {
              // Surface otherwise silent or obscurely reported errors
              console.error(error.message, error.stack);
              throw new ExtensionError(error.message);
            }
          },
          /* Fetch the data for the specified collection by querying the remote settings endpoint directly */
          fetchFromEndpointDirectly: async function fetchFromEndpointDirectly(
            collection,
          ) {
            if (!allowListedCollections.includes(collection)) {
              throw new ExtensionError(
                `This method is not allowed for collection "${collection}"`,
              );
            }
            try {
              const remoteSettingsServer = Services.prefs.getStringPref(
                "services.settings.server",
              );
              const endpoint = `${remoteSettingsServer}${
                remoteSettingsServer.endsWith("/") ? "" : "/"
              }buckets/main/collections/${collection}/records`;
              const response = await fetch(endpoint).catch(async error => {
                throw new Error(error);
              });
              if (!response) {
                throw new Error("Fetched remote settings response empty");
              }
              const parsed = await response.json();
              if (!parsed || !parsed.data) {
                throw new Error(
                  "Fetched remote settings response was incorrectly encoded",
                );
              }
              return parsed.data;
            } catch (error) {
              // Surface otherwise silent or obscurely reported errors
              console.error(error.message, error.stack);
              throw new ExtensionError(error.message);
            }
          },
        },
      },
    };
  }
};
