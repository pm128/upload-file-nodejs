const Upload = require('express').Router();
const Formidable = require('formidable');
const XLSX = require('xlsx');
const _ = require('underscore');
const Db = require('../db');
const DbValidation = require('../services/dbValidation');

/* Service */
const ValidateFile = require('../services/validateFile');
const CustomerContractService = require('../services/customerContractService');
const ProductPricingScheduleService = require('../services/productPricingScheduleService');
const CustomerBillingAccountService = require('../services/customerBillingAccountService');

/**Upload path for excel file upload
 * read the content of each sheet using xlxs module
 * save the result of each sheet into an array
 **/
Upload.post('/upload', function (req, res) {
  let finalResult = [];
  let form = new Formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {

    if (err) res.json({
      Error: err,
      Location: [{ file: changable}];
    });

    let workbook = XLSX.readFile(files.uploads.path, {
      type: "binary",
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    /* DO operations on  workbook here */
    let promise = new Promise((resolve, reject) => {

      workbook.SheetNames.forEach((value) => {
        let worksheet = workbook.Sheets[value];
        let result = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        let item = {
          collectionName: value,
          data: result
        }

        finalResult.push(item);

      });

      resolve(finalResult);

    });

    promise.then((data) => {

      /*XLS sheet validation result*/
      let validationResult = ValidateFile.validateSheetContract(data);

      if (validationResult.length > 0) {

        res.status(400).json(validationResult);
        return;

      }

      /* Contract Id database Validation result */
      DbValidation.getAllContract().then(function (result) {

        let dbValidationResult = DbValidation.dbValidationContract(data, result);
        if (dbValidationResult.length > 0) {

          res.status(400).json(dbValidationResult);
          return;

        }

        let customerContractArray = CustomerContractService.formatCustomerContractCollection(data);
        let productPricingScheduleArray = ProductPricingScheduleService.formatProductPricingScheduleCollection(data);
        let customerBillingAccountArray = CustomerBillingAccountService.getCustomerBillingAccount(data);

        /* Inserted formated result of customer contracts in mongodb */
        try {
          Db.get().collection("customerContract").insertMany(customerContractArray, function (err, response) {
            if (err) throw err;
  
            Db.get().collection("productPricingSchedule").insertMany(productPricingScheduleArray, function (err, response) {
              if (err) throw err;
  
              Db.get().collection("customerBillingAccount").insertMany(customerBillingAccountArray, function (err, response) {
                if (err) throw err;
                let finalresponse = {
                  message: "Successfully inserted all records"
                };
  
                res.status(200).json(finalresponse);
  
              });
  
            });
  
          });

        } catch(error) {
          res.status(400).json(error);
          
        }
        
      });

    });

  });
});



module.exports = Upload;
