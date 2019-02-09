let _ = require('underscore');

module.exports = {

    getCustomerBillingAccount: function(data) {
         
        let indexOfCustomerBillingAccountSheet = _.findIndex(data, { collectionName: 'Customer Billing Accounts'});

        let customerBillingAccounts = data[indexOfCustomerBillingAccountSheet].data;

        return customerBillingAccounts;

    }


}