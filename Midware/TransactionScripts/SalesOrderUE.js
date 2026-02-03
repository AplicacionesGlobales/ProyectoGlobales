/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Ignacio A.
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/file", "N/ui/serverWidget", "./Functions/TransactionFunctions"], function (require, exports, log, file, serverWidget, TransactionFunctions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = exports.beforeLoad = void 0;
    function beforeLoad(pContext) {
        try {
            var newRecord = pContext.newRecord, form = pContext.form;
            var summaryTableScriptInjection = form.addField({
                id: "custpage_add_info_to_sum_table",
                label: " ",
                type: serverWidget.FieldType.INLINEHTML,
            });
            var clientScriptURL = file.load({
                id: 30616, //TODO: check id in Prod
            }).path;
            var minimumOrderAmount = getMinimumOrderCharge(newRecord);
            summaryTableScriptInjection.defaultValue = "<script>jQuery(function(){ require(['".concat(clientScriptURL, "'], function(module){module.addMinimumOrderChargeToSummary(").concat(minimumOrderAmount, ");});});</script>");
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(pContext) {
        try {
            var newRecord = pContext.newRecord, type = pContext.type, UserEventType = pContext.UserEventType;
            var isCreateMode = type === UserEventType.CREATE;
            var isEditMode = type === UserEventType.EDIT;
            if (!isCreateMode && !isEditMode)
                return;
            var complementOrderMin = newRecord.getValue({
                fieldId: "custbody_mw_complement_order_min",
            });
            if (complementOrderMin) {
                var customerId = newRecord.getValue({ fieldId: "entity" });
                var subTotal = newRecord.getValue({ fieldId: "subtotal" });
                var minAmount = (0, TransactionFunctions_1.getCustomerMinimumOrderAmount)(customerId);
                var complementaryMinAmount = (0, TransactionFunctions_1.calculateMinimumOrderAmount)(subTotal, minAmount);
                newRecord.insertLine({ sublistId: "item", line: 0 });
                newRecord.setSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: 0,
                    value: 329, //TODO: check id on Prod
                });
                newRecord.setSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_mw_bill_by",
                    line: 0,
                    value: null,
                });
                newRecord.setSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: 0,
                    value: 1,
                });
                newRecord.setSublistValue({
                    sublistId: "item",
                    fieldId: "description",
                    line: 0,
                    value: "Minimum Order Charge",
                });
                newRecord.setSublistValue({
                    sublistId: "item",
                    fieldId: "rate",
                    line: 0,
                    value: complementaryMinAmount,
                });
                newRecord.commitLine({ sublistId: "item" });
                newRecord.setValue({
                    fieldId: "custbody_mw_complement_order_min",
                    value: false,
                });
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function getMinimumOrderCharge(pRecord) {
        var lineCount = pRecord.getLineCount({ sublistId: "item" });
        for (var i = 0; i < lineCount; i++) {
            var lineDescription = pRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i });
            if (lineDescription === "Minimum Order Charge") {
                return pRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i });
            }
        }
        return -1;
    }
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
