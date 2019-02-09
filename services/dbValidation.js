const db = require('../db');
const _ = require('underscore');


module.exports = {

  getAllContract: async function () {

    try {
      return await db.get().collection("customerContract").distinct('contract.contractId');
    }
    catch (err) {
      return err;
    }

  },

  dbValidationContract: function (data, result) {

    let indexOfContractSheet = _.findIndex(data, { collectionName: 'Contract' });
    let errorContainer = [];
    let tempArr = [];

    _.forEach(data[indexOfContractSheet].data, function (item) {

      if (result.indexOf(item.contractId) != -1) {

        tempArr.push(item);

      }

    });
    let error = {
      sheetName: 'Contract',
      validationType: 'database',
      data: tempArr
    };

    if (tempArr.length > 0) {
      errorContainer.push(error);

    }

    return errorContainer;


  }


};

module.exports = DbValidation;