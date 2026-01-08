/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Ignacio A.
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search"], function (require, exports, log, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveRecord = void 0;
    var queriesCache = {};
    function saveRecord(pContext) {
        try {
            var currentRecord = pContext.currentRecord;
            var customerOverride = currentRecord.getValue({ fieldId: "custbody_mw_order_amount_override" });
            var subTotal = currentRecord.getValue({ fieldId: "subtotal" });
            var eSurcharge = currentRecord.getValue({ fieldId: "shippingcost" });
            log.debug("[saveRecord] customerOverride", customerOverride);
            log.debug("[saveRecord] totalAmount", subTotal);
            log.debug("[saveRecord] eSurcharge", eSurcharge);
            var totalAmount = Number(subTotal) + Number(eSurcharge);
            if (!customerOverride) {
                var customer = currentRecord.getValue({ fieldId: "entity" });
                var customerMinimumOrderAmount = getCustomerMinimumOrderAmount(customer);
                log.debug("[saveRecord] customerMinimumOrderAmount", customerMinimumOrderAmount);
                if (Number(totalAmount) < customerMinimumOrderAmount) {
                    return confirm("This customer minimum order amount is ".concat(customerMinimumOrderAmount, ". Do you want to continue?"));
                }
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.saveRecord = saveRecord;
    function getCustomerMinimumOrderAmount(customerId) {
        if (queriesCache["".concat(customerId, "-custentity_mw_minimum_order_amount")]) {
            var _a = queriesCache["".concat(customerId, "-custentity_mw_minimum_order_amount")], executionTime = _a.executionTime, value = _a.value;
            var currentTime = Date.now();
            var cacheExpirationTime = 2 * 60 * 1000; // 2 minutes in milliseconds
            if (currentTime - executionTime < cacheExpirationTime) {
                return value;
            }
        }
        var customerLookup = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerId,
            columns: ["custentity_mw_minimum_order_amount"],
        });
        var minimumOrderQuantity = customerLookup && customerLookup.custentity_mw_minimum_order_amount
            ? Number(customerLookup.custentity_mw_minimum_order_amount)
            : 0;
        queriesCache["".concat(customerId, "-custentity_mw_minimum_order_amount")] = {
            executionTime: Date.now(),
            value: minimumOrderQuantity,
        };
        return minimumOrderQuantity;
    }
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
