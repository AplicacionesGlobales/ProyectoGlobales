/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Duncan Midware
 * @contact contact@midware.net
 * @description Filters items on Purchase Order based on vendor selection
 */
define(["N/search"], function (search) {
  /**
   * Page Init - Filters items when form loads in edit mode
   */
  function pageInit(context) {
    var currentRec = context.currentRecord;
    var vendor = currentRec.getValue({ fieldId: "entity" });

    if (vendor && context.mode === "edit") {
      filterItemsByVendor(currentRec, vendor);
    }
  }

  /**
   * Field Changed - Filters items when vendor is changed
   */
  function fieldChanged(context) {
    var currentRec = context.currentRecord;
    var fieldId = context.fieldId;

    if (fieldId === "entity") {
      var vendor = currentRec.getValue({ fieldId: "entity" });

      if (vendor) {
        filterItemsByVendor(currentRec, vendor);
      }
    }
  }

  /**
   * Filters the item field based on vendor
   */
  function filterItemsByVendor(currentRec, vendorId) {
    try {
      // Search for items where the vendor is in the item's vendor list
      var itemSearch = search.create({
        type: search.Type.ITEM,
        filters: [
          ["isinactive", "is", "F"],
          "AND",
          ["vendorpricecurrency.internalid", "anyof", vendorId],
        ],
        columns: ["internalid", "itemid", "displayname"],
      });

      var itemResults = itemSearch.run().getRange({ start: 0, end: 1000 });

      // Get the item field on the sublist
      var itemField = currentRec.getSublistField({
        sublistId: "item",
        fieldId: "item",
      });

      if (itemField) {
        // Clear existing options
        itemField.removeSelectOption({ value: null });

        // Add filtered items as options
        itemResults.forEach(function (result) {
          var itemId = result.getValue("internalid");
          var itemName =
            result.getValue("displayname") || result.getValue("itemid");

          itemField.addSelectOption({
            value: itemId,
            text: itemName,
          });
        });

        console.log(
          "Item field filtered. Found " +
            itemResults.length +
            " items for vendor: " +
            vendorId
        );
      }
    } catch (e) {
      console.error("Error filtering items by vendor", e.message);
    }
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
  };
});
