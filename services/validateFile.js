let _ = require('underscore');

module.exports = {

    validateSheetContract: function (data) {


        /* Contract sheet validaton check for unqiue contract to customer mapping */
        let errorContainer = [];
        let indexOfContractSheet = _.findIndex(data, { collectionName: 'Contract' });
        let indexOfSoaSheet = _.findIndex(data, { collectionName: 'SoA' });

        let valueInContractArray = _.pluck(data[indexOfContractSheet].data, 'contractId');
        let uniqueContractArray = _.uniq(valueInContractArray);


        if (valueInContractArray.length != uniqueContractArray.length) {

            let duplicateContracts = _.filter(valueInContractArray, function (item) {

                return valueInContractArray.indexOf(item) != valueInContractArray.lastIndexOf(item);

            })

            let duplicateValues = ValidateFile.getDuplicateContract(data[indexOfContractSheet].data, duplicateContracts);
            if (duplicateValues.length > 0) {
                
                let error = {
                    sheetName: 'Contract',
                    data: duplicateValues
                }

                errorContainer.push(error);
            }

        }

        /* SOA sheet validation no additional contract in soa sheet */

        let valueInSoaContractArray = _.pluck(data[indexOfSoaSheet].data, 'contractId');
        let unqiueSoaContractArray = _.uniq(valueInSoaContractArray);

        let duplicateSoaContract = ValidateFile.getAdditionalSoaContract(unqiueSoaContractArray, uniqueContractArray, data[indexOfSoaSheet].data);
        if (duplicateSoaContract.length > 0) {
            let error = {
                sheetName: 'Soa',
                data: duplicateSoaContract
            }
            errorContainer.push(error);

        }

        return errorContainer;
    },

    getDuplicateContract: function (contractSheetData, duplicateContracts) {

        let duplicates = _.uniq(duplicateContracts);


        let duplicateRows = [];

        _.forEach(contractSheetData, function (item) {

            if (duplicates.indexOf(item.contractId) != -1) {

                duplicateRows.push(item);

            }

        });

        return duplicateRows;

    },

    getAdditionalSoaContract: function (soa, contract, data) {

        let additionalSoaRows = [];

        _.forEach(soa, function (item) {

            if (contract.indexOf(item) == -1) {


                additionalSoaRows.push(_.where(data, { contractId: item }))

            }

        });


        return _.flatten(additionalSoaRows);

    }

};

module.exports = ValidateFile;
