/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * @author Cycle
 */

define([
  "N/record",
  "N/search",
  "N/runtime",
  "N/log",
  "N/file",
  "N/encode",
  "N/format",
], function (record, search, runtime, log, file, encode, format) {
  const BATCH_USAGE_THRESHOLD = 100;

  // File Cabinet root folders to search
  const FILE_CABINET_ROOTS = [
    { id: -15, name: "SuiteScripts" },
    { id: -6, name: "Templates/E-mail Templates" },
    { id: -5, name: "Templates/Marketing Templates" },
    { id: -100, name: "Web Site Hosting Files" },
  ];

  // Global log collector for sending logs to backend
  const logCollector = {
    logs: [],
    maxLogs: 100, // Limit number of logs to avoid large responses

    add: function (level, title, details) {
      if (this.logs.length >= this.maxLogs) return; // Don't exceed max

      this.logs.push({
        timestamp: new Date().toISOString(),
        level: level,
        title: title,
        details: details,
      });
    },

    clear: function () {
      this.logs = [];
    },

    get: function () {
      return this.logs;
    },
  };

  // Wrapper functions for logging that also collect logs
  const logger = {
    debug: function (title, details) {
      log.debug(title, details);
      logCollector.add("DEBUG", title, details);
    },

    audit: function (title, details) {
      log.audit(title, details);
      logCollector.add("AUDIT", title, details);
    },

    error: function (title, details) {
      log.error(title, details);
      logCollector.add("ERROR", title, details);
    },
  };

  function createErrorObject(
    err,
    path = null,
    fileName = null,
    additionalData = {}
  ) {
    const errorObj = {
      message: err.message || err.toString(),
      stack: err.stack || null,
      ...additionalData,
    };

    if (path) errorObj.path = path;
    if (fileName) errorObj.fileName = fileName;
    // Add error name/type if available
    if (err.name) errorObj.errorType = err.name;
    // Add error code if available (NetSuite errors often have this)
    if (err.code) errorObj.errorCode = err.code;

    return errorObj;
  }

  function parseNetSuiteDateToUTC(modifiedStr) {
    // modifiedStr example: "10/31/2025 1:32 pm"
    // Use NetSuite's format.parse() to correctly handle timezone conversion
    try {
      // Parse the date string using NetSuite's format module
      // This automatically handles the account's timezone settings
      const parsedDate = format.parse({
        value: modifiedStr,
        type: format.Type.DATETIMETZ,
      });

      return parsedDate;
    } catch (err) {
      logger.error({
        title: "parseNetSuiteDateToUTC Error",
        details: JSON.stringify({
          input: modifiedStr,
          error: err.message,
          stack: err.stack,
        }),
      });
      // Re-throw with context so caller can handle
      const enhancedError = new Error(
        `Failed to parse date '${modifiedStr}': ${err.message}`
      );
      enhancedError.name = err.name;
      enhancedError.code = err.code;
      enhancedError.stack = err.stack;
      enhancedError.inputDate = modifiedStr;
      throw enhancedError;
    }
  }

  //Get only server Date portion from an UTC datetime
  function parseUTCToServerDate(filterDateUTC) {
    const filterDate =
      typeof filterDateUTC === "string"
        ? new Date(filterDateUTC)
        : filterDateUTC;

    logger.debug({
      title: "Filter date UTC (input)",
      details: filterDate.toISOString(),
    });

    const nsDateTime = format.format({
      value: filterDate,
      type: format.Type.DATETIMETZ,
    });

    // Now extract just the date portion from the server's timezone
    return format.format({
      value: format.parse({
        value: nsDateTime,
        type: format.Type.DATETIMETZ,
      }),
      type: format.Type.DATE,
    });
  }

  function doGet(requestParams) {
    logger.debug(
      "RESTlet GET",
      "Request received with params: " + JSON.stringify(requestParams)
    );
    var user = runtime.getCurrentUser();
    return {
      success: true,
      message: "Restlet get response",
      timestamp: new Date().toISOString(),
      method: "GET",
      requestParams: requestParams,
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /******************************** END HANDLERS ********************************/

  return {
    get: doGet,
  };
});
