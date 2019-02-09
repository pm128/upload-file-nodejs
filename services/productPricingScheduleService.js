let _ = require('underscore');

module.exports = {

  /** 
   * @param {data} data is complete excel sheet data 
   * function return the final array which will be saved in mongoDb 
   */
  formatProductPricingScheduleCollection: function (data) {

    let temparr = [];
    let resultedArray = [];
    let indexOfContractSheet = _.findIndex(data, {
      collectionName: 'Contract'
    });


    if (indexOfContractSheet != -1) {

      data[indexOfContractSheet].data.forEach(function (value) {
        let tempobj = {
          customerId: '',
          cleName: '',
          contract: []
        };

        if (temparr.indexOf(value.customerId) == -1) {

          temparr.push(value.customerId);
          tempobj.customerId = value.customerId;
          tempobj.cleName = value.cleName;
          let formatedContract = ProductPricingScheduleService.formatProductPricingContract(value, data);
          tempobj.contract.push(formatedContract);
          resultedArray.push(tempobj);

        } else {

          let index = _.findIndex(resultedArray, {
            customerId: value.customerId
          });
          resultedArray[index].contract.push(ProductPricingScheduleService.formatProductPricingContract(value, data));

        }
      });
    } else {

      let error = {
        statusCode: 400,
        message: 'Contract Sheet not found in file'
      };
      return error;
    }

    return resultedArray;
  },

  /**
   * 
   * @param {*} value value of indiviual contract for customer
   * this function format the contract data in defined format
   */
  formatProductPricingContract: function (value, data) {
    let singleContract = {
      pricingSchedule: [],
    };

    singleContract.contractId = value.contractId;
    singleContract.contractStatus = value.contractStatus;


    let indexOfPsLinkSheet = _.findIndex(data, {
      collectionName: 'PS Link'
    });

    data[indexOfPsLinkSheet].data.forEach(function (item) {

      if (item.contractId === value.contractId) {

        let pricingScheduleObj = {
          billingProfile: []
        };

        pricingScheduleObj = Object.assign(pricingScheduleObj, item);
        delete pricingScheduleObj.contractId;
        delete pricingScheduleObj.cleName;

        let resultedBillingProfile = ProductPricingScheduleService.formatBillingProfile(item, value.customerId, data);
        pricingScheduleObj.billingProfile = resultedBillingProfile;
        singleContract.pricingSchedule.push(pricingScheduleObj);

      }

    });

    return singleContract;

  },
  /** 
   * @param item  item is the single row item from PS link array
   *  Description: This item will be used to check billing profile in "Billing Account PS" sheet array 
   * and later on check the "Customer Billing Accounts" sheet array to verfify particular billing account for customer
   */

  formatBillingProfile: function (item, id, data) {

    let billingAccountsForUser = [];
    let indexOfCustomerBillingAccountsSheet = _.findIndex(data, {
      collectionName: 'Customer Billing Accounts'
    });
    let indexOfBillingAccountPsSheet = _.findIndex(data, {
      collectionName: 'Billing Account PS'
    });

    data[indexOfBillingAccountPsSheet].data.forEach(function (value) {

      if (value.pricingScheduleId === item.pricingScheduleId) {

        data[indexOfCustomerBillingAccountsSheet].data.forEach(function (x) {

          if (x.customerId === id) {

            if (x.billingAccountCode === value.billingAccountCode) {

              let obj = Object.assign({}, value);
              delete obj.pricingScheduleId;
              delete obj.pricingAgreementName;


              billingAccountsForUser.push(obj);

            }

          }

        });

      }

    });

    return billingAccountsForUser;

  }



};

module.exports = ProductPricingScheduleService;