 const express = require('express');
const { providerRegistration, isProviderExists, customerApprove, customerDissApprove, getCustomer, milkTransaction,  historyOfPayment, addCustomerPaymentDetails, addPrice, addCustomerPayment, historyOfCustomer, getSalesInformation, approveMilkQuantity, customerListToChangeMilkVolume, findMilkDetails } = require('../controller/providerController');
const { route } = require('./customerRoutes');



const router = express.Router();


// POST ||PROVIDER REGISTRATION
router.post('/providerRegistration',providerRegistration);


// POST || PROVIDER EIXSTS
router.post('/isProviderExists',isProviderExists);


// POST || DISSAPPROVECUSTOMERLIST
// router.post('/dissApproveCustomerList',dissApproveCustomerList);

// POST || FOR CUSTOMER APPROVE
router.post('/customerApprove',customerApprove);

// POST || FOR DISS APPROVE OF CUSTOMER
router.post('/customerDissApprove',customerDissApprove);

// POST || FOR GET ALL THE PROVIDER
router.post('/getCustomer',getCustomer);



// Here Start Transaction API
router.post("/milkTransaction",milkTransaction);

// it is for history of customer 

router.post("/historyOfCustomer",historyOfCustomer);



// it is handle the history of payments || POST
router.post("/historyOfPayment",historyOfPayment);

// it is for adding payment details of customer
router.post('/addCustomerPayment',addCustomerPayment);


// it is for adding price of milk
router.post("/addPrice",addPrice);


// it is for the history of transaction

router.post("/historyOfTransaction",historyOfPayment);


// it is for getting the sale information
router.post('/getSalesInformation',getSalesInformation);


// customer List which have request to change milk volume
router.post("/customerListToChangeMilkVolume",customerListToChangeMilkVolume);



// it is for approve the Milk Quantity
router.post("/approveMilkQuantity",approveMilkQuantity);


// it is for findting the milk Details
router.post("/findMilkDetails",findMilkDetails);

module.exports=router;



