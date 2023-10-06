const dbconnection = require("../config/dbconnection");
const CustomerMaster = require("../Model/CustomerModel");
const MilkInfoModel = require("../Model/milkInfoModel");
const providerModel = require("../Model/providerModel");
const transactionModel = require("../Model/transaction");

// it is for indentification of user
const userIdentification = async (req, resp) => {
  try {
    const isCustomer = await CustomerMaster.findOne({
      customerPhoneNumber: req.body.phoneNumber,
    });

    const modifiedCustomer = JSON.parse(JSON.stringify(isCustomer));
    if (isCustomer) {
      delete modifiedCustomer.allProvider;
      delete modifiedCustomer.approveProvider;
      resp.status(200).send({
        success: true,
        flag: 2,
        customer: modifiedCustomer,
      });
    }
    const isProvider = await providerModel.findOne({
      providerPhoneNumber: req.body.phoneNumber,
    });
    const modifiedProvider = JSON.parse(JSON.stringify(isProvider));
    if (isProvider) {
      delete modifiedProvider.AllCustomers;
      delete modifiedProvider.ApproveCustomers;
      resp.status(200).send({
        success: true,
        flag: 1,
        provider: modifiedProvider,
      });
    } else {
      resp.status(200).send({
        success: true,
        flag: 3,
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// Customer Register
const customerRegistration = async (req, resp) => {
  try {
    const connection = await dbconnection();

    const existCustomer = await CustomerMaster.findOne({
      customerPhoneNumber: req.body.customerPhoneNumber,
    });

    if (existCustomer) {
      const modifiedCustomer = JSON.parse(JSON.stringify(existCustomer));
      delete modifiedCustomer.allProvider;
      delete modifiedCustomer.approveProvider;
      resp.status(200).send({
        message: "You have Already Account",
        success: true,
        customer: modifiedCustomer,
      });
    } else {
      const newCustomer = new CustomerMaster(req.body);
      await newCustomer.save(); // Await the save operation
      const customerDetail = await CustomerMaster.findOne({
        customerPhoneNumber: req.body.customerPhoneNumber,
      });

      const modifiedNewCustomer = JSON.parse(JSON.stringify(customerDetail));
      delete modifiedNewCustomer.allProvider;
      delete modifiedNewCustomer.approveProvider;
      resp.status(200).send({
        success: true,
        message: "Register Successfully",
        customer: modifiedNewCustomer,
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({ message: `Error occurred: ${error}` });
  }
};

// Customer Edit profile

const editProfile = async (req, resp) => {
  try {
    const updateCustomer = await CustomerMaster.findByIdAndUpdate(
      { _id: req.body.customerId },
      req.body
    );
    const changeCustomer = await CustomerMaster.findById({
      _id: req.body.customerId,
    });
    const modifiedCustomer = JSON.parse(JSON.stringify(changeCustomer));
    delete modifiedCustomer.approveProvider;
    delete modifiedCustomer.allProvider;
    resp.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      cusotmer: modifiedCustomer,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// add the provider

const addProvider = async (req, resp) => {
  try {
    const customerId = req.body.customerId;

    const customerMorningCowVolume = req.body.customerMorningCowVolume;
    const customerMorningBuffeloVolume = req.body.customerMorningBuffeloVolume;
    const customerMorningOtherVolume = req.body.customerMorningOtherVolume;

    const customerEveningCowVolume = req.body.customerEveningCowVolume;
    const customerEveningBuffeloVolume = req.body.customerEveningBuffeloVolume;
    const customerEveningOtherVolume = req.body.customerEveningOtherVolume;

    const milkDetail = await MilkInfoModel.findOne({
      customerId: req.body.customerId,
      providerId: req.body.providerId,
      isApprove: true,
    });

    if (milkDetail) {
      resp.status(200).send({
        success: false,
        message: "Provider already exists",
      });
    } else {
      const isProviderExist = await MilkInfoModel.findOne({
        customerId: req.body.customerId,
        providerId: req.body.providerId,
        isApprove: false,
      });
      if (isProviderExist) {
        resp.status(201).send({
          success: false,
          message: "request already sent to provider",
        });
      } else {
        const newMilkDetail = new MilkInfoModel({
          customerId: req.body.customerId,
          providerId: req.body.providerId,

          cowMorning: customerMorningCowVolume,
          cowEvening: customerEveningCowVolume,

          buffelowMorning: customerMorningBuffeloVolume,
          buffelowEvening: customerEveningBuffeloVolume,

          otherMorning: customerMorningOtherVolume,
          otherEvening: customerEveningOtherVolume,
        });
        await newMilkDetail
          .save()
          .then((result) => {
            resp.status(200).send({
              success: true,
              message: "We have sent to the provider",
            });
          })
          .catch((err) => {
            console.log(err);
            resp.status(201).send({
              success: false,
              message: "unable to send request to provider",
            });
          });
      }
    }
  } catch (error) {
    console.error(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

// get provider

const getProvider = async (req, resp) => {
  try {
    const customerId = req.body.customerId;

    const providerList = await MilkInfoModel.find({
      customerId: customerId,
      isApprove: true,
    });


    if(providerList.length<1){
      resp.status(201).send({
        success:false,
        message:"Customer not found"
      })
    }
    const providerDetails=[];

    for(let i=0;i<providerList.length;i++) {
         const association=providerList[i];
         const provider=await providerModel.findById({
          _id:association.providerId
         });
         providerDetails.push(provider);
    }

    resp.status(200).send({
      success: true,
      providerList,
      providerDetails
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// get card detail

const cardDetails = async (req, resp) => {
  try {
    const year = parseInt(req.body.year);
    const month = parseInt(req.body.month);

    const cardDetails = await transactionModel.find({
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
          { $eq: ["$providerId", req.body.providerId] },
          { $eq: ["$customerId", req.body.customerId] },
        ],
      },
    });

    if (cardDetails.length == 0) {
      resp.status(200).send({
        success: true,
        message: "Transaction Not Available",
      });
    } else {
      resp.status(200).send({
        success: true,
        message: "Card Details",
        cardDetails,
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// it if for changeing the milkquality

const changeMilkQuality = async (req, resp) => {
  try {
    const previousMilkDetail = await MilkInfoModel.findOne({
      customerId: req.body.customerId,
      providerId: req.body.providerId,
      isApprove: true,
    });

    const alreadyapplied = await MilkInfoModel.findOne({
      customerId: req.body.customerId,
      providerId: req.body.providerId,
      isApprove: false,
    });

    if (alreadyapplied) {
      resp.status(200).send({
        success: false,
        message: "You have already requested",
      });
    }

    console.log(previousMilkDetail);

    if (previousMilkDetail) {
      const newMilkVolume = await MilkInfoModel({
        customerId: req.body.customerId,
        providerId: req.body.providerId,
        cowMorning: req.body.cowMorning,
        cowEvening: req.body.cowEvening,
        buffelowMorning: req.body.buffelowMorning,
        buffelowEvening: req.body.buffelowEvening,
        otherMorning: req.body.otherMorning,
        otherEvening: req.body.otherEvening,
      });

      await newMilkVolume.save();
      resp.status(200).send({
        success: true,
        message: "we have send to request ot provider to approve",
      });
    } else {
      resp.status(200).send({
        success: false,
        message: "we Can't find any provious Milk Volume",
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};

module.exports = {
  customerRegistration,
  userIdentification,
  editProfile,
  addProvider,
  getProvider,
  cardDetails,
  changeMilkQuality,
  sendMessage,
};
