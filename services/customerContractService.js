let _ = require('underscore');

module.exports = {

  /**
   * @param {data} data is complete excel sheet data 
   * function return the final array which will be saved in mongoDb 
   */
  formatCustomerContractCollection: function (data) {

    let temparr = [];
    let resultedArray = [];
    let indexOfContractSheet = _.findIndex(data, {
      collectionName: 'Contract'
    });

    if (indexOfContractSheet != -1) {

      _.forEach(data[indexOfContractSheet].data, function (value) {

        let tempobj = {
          customerId: '',
          cleName: '',
          contract: []
        };

        if (temparr.indexOf(value.customerId) == -1) {

          temparr.push(value.customerId);
          tempobj.customerId = value.customerId;
          tempobj.cleName = value.cleName;
          let formatedContract = CustomerContractService.formatContract(value, data);
          tempobj.contract.push(formatedContract);
          resultedArray.push(tempobj);

        } else {

          let index = _.findIndex(resultedArray, {
            customerId: value.customerId
          });
          resultedArray[index].contract.push(CustomerContractService.formatContract(value, data));

        }

      });

    } else {

      let error = {
        statusCode: 400,
        message: 'Contract Sheet not found in file'
      }
      return error;
    }
    return resultedArray;


  },

  /**
   * 
   * @param {*} value value of indiviual contract for customer
   * this function format the contract data in defined format
   */
  formatContract: function (value, data) {
    let singleContract = {
      contractId: '',
      contractStatus: '',
      legalNoticeContact: [],
      soaDetails: []
    }
    let legalNoticeObj = {
      name: '',
      email: '',
      address: '',
      fax: ''
    }

    /************ SingleContract.LegalNoticeContact Array Updates Start ****************/
    let legalKeyArray = Object.keys(value).filter(function (prop) {
      return prop.indexOf('legal') === 0 || prop.indexOf('Legal') === 0;
    });

    _.forEach(legalKeyArray, function (key) {

      if (key.includes('Name')) {

        legalNoticeObj.name = value[key];

      } else if (key.includes('Address')) {

        legalNoticeObj.address = value[key];

      } else if (key.includes('Email')) {

        legalNoticeObj.email = value[key];

      } else {

        legalNoticeObj.fax = value[key];
        singleContract.legalNoticeContact.push(legalNoticeObj);
        legalNoticeObj = Object.assign({}, legalNoticeObj);

      }
      delete value[key];

    });
    singleContract = Object.assign(singleContract, value);
    delete singleContract.cleName;

    /************ SingleContract.LegalNoticeContact Array Updates End ****************/

    /************ SingleContract.SOADetails Array Updated Start ****************/
    let indexOfSoaSheet = _.findIndex(data, {
      collectionName: 'SoA'
    });
    _.forEach(data[indexOfSoaSheet].data, function (item) {

      if (item.contractId === value.contractId) {
        let sectors = [];
        let sectorKeys = Object.keys(item).filter(function (prop) {
          return prop.indexOf('sector') === 0;
        });

        sectorKeys.forEach(function (key) {
          sectors.push(item[key]);
          delete item[key];
        });
        item.sector = sectors;
        singleContract.soaDetails.push(item);
      }

    });

    /************ SingleContract.SOADetails Array Updated End ****************/
    return singleContract;

  }


};

module.exports = CustomerContractService;