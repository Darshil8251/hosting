require("dotenv").config();

const CustomerMaster = require("../Model/CustomerModel");
const milkDetail = require("../Model/milkPriceModel");
const providerModel = require("../Model/providerModel");
const transactionModel = require("../Model/transaction");
const dbconnection = require("../config/dbconnection");
const moment = require("moment");
const paymentModel = require("../Model/paymentModel");

const { DateTime } = require("luxon");
const MilkInfoModel = require("../Model/milkInfoModel");

// it is function for convert name of month into digits
function getMonthDigit(monthName) {
  const date = new Date(`${monthName} 1, 2000`); // Create a date object with the given month name
  const monthDigit = String(date.getMonth() + 1).padStart(2, "0"); // Get the month digit and pad with leading zero if necessary
  return monthDigit;
}

// it is for customer registration

const providerRegistration = async (req, resp) => {
  try {
    const connection = await dbconnection();
    const userExists = await providerModel.findOne({
      providerPhoneNumber: req.body.providerPhoneNumber,
    });

    if (userExists) {
      const providerModification = JSON.parse(JSON.stringify(userExists));

      delete providerModification.AllCustomers;
      delete providerModification.ApproveCustomers;
      resp.status(200).send({
        success: true,
        message: "You Have Already Account",
        provider: providerModification,
      });
    } else {
      const newProvider = await providerModel(req.body);
      await newProvider.save();
      const provider = await providerModel.findOne({
        providerPhoneNumber: req.body.providerPhoneNumber,
      });
      delete provider.AllCustomers;
      delete provider.ApproveCustomers;
      console.log(provider);
      resp.status(200).send({
        success: true,
        message: "Register Successfully",
        provider: provider,
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

// it is check wether provider available or not

const isProviderExists = async (req, resp) => {
  try {
    const isProvider = await providerModel.findOne({
      providerPhoneNumber: req.body.providerPhoneNumber,
    });

    const modifiedProvider = JSON.parse(JSON.stringify(isProvider));
    if (isProvider) {
      delete modifiedProvider.AllCustomers;
      delete modifiedProvider.ApproveCustomers;
      resp.status(200).send({
        success: true,
        message: "Yes, Provider Exists",
        provider: modifiedProvider,
      });
    } else {
      resp.status(200).send({
        success: false,
        message: "No, Provider Does Not Exist",
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: fasle,
      message: error,
    });
  }
};

// it is for disapproval customer list

const dissApproveCustomerList = async (req, res) => {
  try {
    const providerId = req.body.providerId;

    const provider = await providerModel.findById({
      _id: providerId,
    });

    const dissAproveCusotomerList = provider.AllCustomers;

    if (dissAproveCusotomerList.length > 0) {
      res.status(200).send({
        success: true,
        dissAproveCusotomerList,
      });
    } else {
      res.status(201).send({
        success: true,
        message: "customer Not Found",
      });
    }
   
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
};

// it is for customer approval
const customerApprove = async (req, resp) => {
  try {
    // find the provider
    const provider = await providerModel.findByIdAndUpdate({
      _id: req.body.providerId,
    });

    // find the customer
    const insertCustomer = await CustomerMaster.findById({
      _id: req.body.customerId,
    });

    // find the milk quantity
    const milkQuantity = await MilkInfoModel.findOne({
      providerId: req.body.providerId,
      customerId: req.body.customerId,
    });

    if (provider && insertCustomer && milkQuantity) {
      const modifiedCustomer = JSON.parse(JSON.stringify(insertCustomer));

      // Remove the 'allProvider' and 'approveProvider' fields from the copied object
      delete modifiedCustomer.allProvider;
      delete modifiedCustomer.approveProvider;

      // find the index of customer
      const customerIndex = provider.AllCustomers.findIndex(
        (obj) => obj._id == req.body.customerId
      );

      // if index -1 then

      if (customerIndex == -1) {
        resp.status(401).send({
          success: false,
          message: "You Have Alredy Approve The customer",
        });
      }

      // find the customer
      const customer = await CustomerMaster.findByIdAndUpdate({
        _id: req.body.customerId,
      });

      const insertProvider = await providerModel.findById({
        _id: req.body.providerId,
      });

      const modifiedProvider = JSON.parse(JSON.stringify(insertProvider));
      delete modifiedProvider.AllCustomers;
      delete modifiedProvider.ApproveCustomers;

      const providerIndex = customer.allProvider.findIndex(
        (obj) => obj._id == req.body.providerId
      );

      // if index -1
      if (providerIndex == -1) {
        resp.status(4001).send({
          success: false,
          message: "You have Already Approve the customer",
        });
      }

      // if we get index!=-1 that means not customer found
      else if (customerIndex != -1) {
        provider.AllCustomers.splice(customerIndex, 1);
        provider.ApproveCustomers.push(modifiedCustomer);
        await provider.save();
      }

      // it is for index!=-1
      if (providerIndex != -1) {
        customer.allProvider.splice(providerIndex, 1);
        customer.approveProvider.push(modifiedProvider);
        await customer.save();
      }

      // her approve the milkQuantity of the customer
      milkQuantity.isApprove = true;
      await milkQuantity.save();

      resp.status(200).send({
        success: true,
        message: "Customer Approve Successfully",
      });
    } else {
      resp.status(401).send({
        success: false,
        message: "Sufficient Data Not Found",
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

// it is for customerDisapproval
const customerDissApprove = async (req, resp) => {
  try {
    const milkInfo = await MilkInfoModel.findOne({
      customerId: req.body.customerId,
      providerId: req.body.providerId,
      isApprove: false,
    });

    const provider = await providerModel.findByIdAndUpdate({
      _id: req.body.providerId,
    });

    const customer = await CustomerMaster.findByIdAndUpdate({
      _id: req.body.customerId,
    });

    if (milkInfo && provider && customer) {
      await milkInfo.remove();
      await milkInfo.save();

      // find the index of customer
      const customerIndex = provider.AllCustomers.findIndex(
        (obj) => obj._id == req.body.customerId
      );

      // find customer  index

      const providerIndex = customer.allProvider.findIndex(
        (obj) => obj._id == req.body.providerId
      );

      // if index 1
      if (customerIndex == -1) {
        resp.status(401).send({
          success: false,
          message: "You Have Already Disapprove Customer",
        });
      }

      // if provider index -1

      if (providerIndex == -1) {
        resp.status(401).send({
          success: false,
          message: "You Have already Disapprove Customer",
        });
      }

      // if we get index=-1 that means not customer found
      if (customerIndex != -1) {
        provider.AllCustomers.splice(customerIndex, 1);
        await provider.save();
      }

      if (providerIndex != -1) {
        customer.allProvider.splice(providerIndex, 1);
        await customer.save();
      }

      resp.status(200).send({
        success: true,
        message: "Customer Disapprove Successfully",
      });
    } else {
      resp.status(200).send({
        success: false,
        message: "Something Went Wrong",
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

// it is for getting the detail of customer
const getCustomer = async (req, resp) => {
  try {
    const provider = await providerModel.findById({ _id: req.body.providerId });

    const allCustomer = provider.ApproveCustomers;

    if (allCustomer.length == 0) {
      resp.status(200).send({
        success: false,
        message: "No Customer Available",
      });
    } else {
      resp.status(200).send({
        success: true,
        message: "All Customer",
        customer: allCustomer,
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

// it is for milkTransaction
const milkTransaction = async (req, resp) => {
  try {
    const today = new Date();
    const getday = today.toISOString().substring(0, 10);
    const isFirstDayOfMonth = today.getDate() === 1;

    let transaction = await transactionModel.findOne({
      customerId: req.body.customerId,
      providerId: req.body.providerId,
      date: getday,
    });

    const allPrice = await milkDetail.findOne({
      providerId: req.body.providerId,
      active: true,
    });

    const cowPrice = allPrice.cowPrice;
    const buffelowPrice = allPrice.buffelowPrice;
    const otherPrice = allPrice.otherPrice;

    // if transaction available
    if (transaction) {
      // it transaction already done
      if (
        transaction.morningTransaction &&
        transaction.eveningTransaction &&
        req.body.evening &&
        req.body.morning
      ) {
        return resp.status(200).send({
          success: true,
          message: "Transaction Already Completed",
        });
      }

      // if morning transaction available
      else if (transaction.morningTransaction && req.body.morning) {
        resp.status(200).send({
          success: false,
          message: "Morning Transaction Already Completed",
        });
      }

      // if evening transaction available
      else if (
        transaction.morningTransaction &&
        transaction.eveningTransaction &&
        req.body.evening
      ) {
        resp.status(200).send({
          success: false,
          message: "Evening Transaction Already Completed",
        });
      }
      // after the morning transaction is completed,then evening transaction
      else if (
        transaction.morningTransaction &&
        !transaction.eveningTransaction &&
        req.body.evening
      ) {
        try {
          let totalAmount = 0;

          totalAmount =
            req.body.cowMorning * cowPrice +
            req.body.buffelowMorning * buffelowPrice +
            req.body.otherMorning * otherPrice +
            transaction.theseMonthAmount;
          transaction.cowEvening = req.body.cowEvening;
          transaction.buffelowEvening = req.body.buffelowEvening;
          transaction.otherEvening = req.body.otherEvening;
          transaction.theseMonthAmount = totalAmount;
          transaction.eveningTransaction = true;
          await transaction
            .save()
            .then(() => {
              resp.status(200).send({
                success: true,
                message: "Evening Transaction Successfully",
              });
            })
            .catch((err) => {
              console.log(err);
              resp.status(500).send({
                success: false,
                message: "Transaction Failed",
              });
            });
        } catch (error) {
          console.log(error);
          resp.status(500).send({
            success: false,
            message: error,
          });
        }
      }
    }

    // if we don't found any transaction
    else {
      // if it is morning transaction

      if (req.body.morning && !req.body.evening) {
        const lastTransaction = await transactionModel
          .findOne({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
          })
          .sort({ _id: -1 })
          .exec();

        let totalAmount = 0;
        let addPreviousAmount = 0;

        // if lastTransaction found
        if (lastTransaction) {
          const lastTheseMontehAmount = lastTransaction.theseMonthAmount;
          // if it is first day of month
          if (isFirstDayOfMonth) {
            lastTransaction.previousAmount += lastTheseMontehAmount;
            await lastTransaction.save();
            addPreviousAmount = lastTransaction.previousAmount;
            totalAmount =
              req.body.cowMorning * cowPrice +
              req.body.buffelowMorning * buffelowPrice +
              req.body.otherMorning * otherPrice;
          } else {
            totalAmount =
              req.body.cowMorning * cowPrice +
              req.body.buffelowMorning * buffelowPrice +
              req.body.otherMorning * otherPrice +
              lastTheseMontehAmount;
          }
        }
        // if not found any lastTransaction
        else {
          totalAmount =
            req.body.cowMorning * cowPrice +
            req.body.buffelowMorning * buffelowPrice +
            req.body.otherMorning * otherPrice;
        }

        const morningTransactions = await transactionModel
          .create({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
            date: getday,
            cowMorning: req.body.cowMorning,
            buffelowMorning: req.body.buffelowMorning,
            otherMorning: req.body.otherMorning,
            theseMonthAmount: totalAmount,
            previousAmount: addPreviousAmount,
            morningTransaction: true,
          })
          .then(() => {
            resp.status(200).send({
              success: true,
              message: "Morning Transaction Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: "Transaction failed",
            });
          });
      }

      // if it is evening a transaction
      else if (req.body.evening && !req.body.morning) {
        const lastTransaction = await transactionModel
          .findOne({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
          })
          .sort({ _id: -1 })
          .exec();
        //if lasttransaction is found

        let totalAmount = 0;
        let addPreviousAmount = 0;
        if (lastTransaction) {
          const lastTheseMontehAmount = lastTransaction.theseMonthAmount;
          if (isFirstDayOfMonth) {
            lastTransaction.previousAmount += lastTheseMontehAmount;
            await lastTransaction.save();
            addPreviousAmount = lastTransaction.previousAmount;
            totalAmount =
              req.body.cowEvening * cowPrice +
              req.body.buffelowEvening * buffelowPrice +
              req.body.otherEvening * otherPrice;
          } else {
            totalAmount =
              req.body.cowEvening * cowPrice +
              req.body.buffelowEvening * buffelowPrice +
              req.body.otherEvening * otherPrice +
              lastTheseMontehAmount;
          }
        }

        // if we have not found any lastTransnction
        else {
          totalAmount =
            req.body.cowEvening * cowPrice +
            req.body.buffelowEvening * buffelowPrice +
            req.body.otherEvening * otherPrice;
        }
        const eveningTransactions = await transactionModel
          .create({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
            date: getday,
            cowEvening: req.body.cowEvening,
            buffelowEvening: req.body.buffelowEvening,
            otherEvening: req.body.otherEvening,
            theseMonthAmount: totalAmount,
            previousAmount: addPreviousAmount,
            eveningTransaction: true,
          })
          .then(() => {
            resp.status(200).send({
              success: true,
              message: "Evening Transaction Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: "Transaction failed",
            });
          });
      }

      // if both transactions occur at same time
      else if (req.body.morning && req.body.evening) {
        const lastTransaction = await transactionModel
          .findOne({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
          })
          .sort({ _id: -1 })
          .exec();
        //if lasttransaction is found
        let totalAmount = 0;
        let totalMorningAmount = 0;
        let totalEveningAmount = 0;
        let addPreviousAmount = 0;
        if (lastTransaction) {
          const lastTheseMontehAmount = lastTransaction.theseMonthAmount;
          if (isFirstDayOfMonth) {
            lastTransaction.previousAmount += lastTheseMontehAmount;
            await lastTransaction.save();
            addPreviousAmount = lastTransaction.previousAmount;
            totalMorningAmount =
              req.body.cowMorning * cowPrice +
              req.body.buffelowMorning * buffelowPrice +
              req.body.otherMorning * otherPrice;

            totalEveningAmount =
              req.body.cowEvening * cowPrice +
              req.body.buffelowEvening * buffelowPrice +
              req.body.otherEvening * otherPrice;

            totalAmount = totalEveningAmount + totalMorningAmount;
          } else {
            totalMorningAmount =
              req.body.cowMorning * cowPrice +
              req.body.buffelowMorning * buffelowPrice +
              req.body.otherMorning * otherPrice +
              lastTheseMontehAmount;

            totalEveningAmount =
              req.body.cowEvening * cowPrice +
              req.body.buffelowEvening * buffelowPrice +
              req.body.otherEvening * otherPrice;

            totalAmount = totalEveningAmount + totalMorningAmount;
          }
        } else {
          totalMorningAmount =
            req.body.cowMorning * cowPrice +
            req.body.buffelowMorning * buffelowPrice +
            req.body.otherMorning * otherPrice;

          totalEveningAmount =
            req.body.cowEvening * cowPrice +
            req.body.buffelowEvening * buffelowPrice +
            req.body.otherEvening * otherPrice;

          totalAmount = totalEveningAmount + totalMorningAmount;
        }

        const bothTransaction = await transactionModel
          .create({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
            date: getday,
            cowMorning: req.body.cowMorning,
            buffelowMorning: req.body.buffelowMorning,
            otherMorning: req.body.otherMorning,
            cowEvening: req.body.cowEvening,
            buffelowEvening: req.body.buffelowEvening,
            otherEvening: req.body.otherEvening,
            theseMonthAmount: totalAmount,
            previousAmount: addPreviousAmount,
            morningTransaction: true,
            eveningTransaction: true,
          })
          .then(() => {
            resp.status(200).send({
              success: true,
              message: "Both Transaction Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: "Transaction failed",
            });
          });
      }
    }
  } catch (error) {
    console.log(error);

    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// it is for sending the message

const addPrice = async (req, resp) => {
  const addPice = new milkDetail(req.body);

  // Save the provider object to the database
  addPice
    .save()
    .then(() => {
      resp.status(200).send({
        success: true,
        message: "Price Added Successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      resp.status(500).send({
        success: false,
        message: error,
      });
    });
};

// it is for show the history of customers
const historyOfCustomer = async (req, resp) => {
  try {
    const history = await transactionModel
      .findOne({
        customerId: req.body.customerId,
        providerId: req.body.providerId,
      })
      .sort({ _id: -1 })
      .exec();

    console.log(history);

    if (history) {
      resp.status(200).send({
        success: true,
        message: "History Found successfully",
        history: history,
      });
    } else {
      resp.status(200).send({
        success: false,
        message: "No history found",
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

// it is for add payment details of customer

const addCustomerPayment = async (req, resp) => {
  try {
    let amount = req.body.amount; // Change 'const' to 'let'

    // find the lastTransaction of customer

    const lastTransaction = await transactionModel
      .findOne({
        customerId: req.body.customerId,
        providerId: req.body.providerId,
      })
      .sort({ _id: -1 })
      .exec();

    if (lastTransaction) {
      // if provious amount of transactions  is not zero
      if (lastTransaction.previousAmount != 0) {
        // if amount is greater than previousRemaining amount
        if (amount >= lastTransaction.previousAmount) {
          amount -= lastTransaction.previousAmount;
          lastTransaction.previousAmount = 0;

          if (amount != 0) {
            let theseMonthAmount = lastTransaction.theseMonthAmount;
            theseMonthAmount -= amount;

            if (amount != 0) {
              lastTransaction.theseMonthAmount = -amount;
            }
          }

          await lastTransaction.save().catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: "failed to save transaction",
            });
          });

          const addPaymentDetail = await paymentModel
            .create({
              customerId: req.body.customerId,
              providerId: req.body.providerId,
              amount: req.body.amount,
              date: new Date(),
              modeOfPayment: req.body.modeOfPayment,
            })
            .then(() => {
              resp.status(200).send({
                success: true,
                message: "Payment Detail Added Successfully",
              });
            })
            .catch((err) => {
              console.log(err);
              resp.status(500).send({
                success: false,
                message: err,
              });
            });
        }

        // if amount is less than the PreviousRemaining amount
        else {
          lastTransaction.previousAmount -= amount;
          await lastTransaction.save().catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: "failed to save transaction",
            });
          });

          const addPaymentDetail = await paymentModel
            .create({
              customerId: req.body.customerId,
              providerId: req.body.providerId,
              amount: req.body.amount,
              date: new Date(),
              modeOfPayment: req.body.modeOfPayment,
            })
            .then(() => {
              resp.status(200).send({
                success: true,
                message: "Payment Details Added Successfully",
              });
            })
            .catch((err) => {
              console.log(err);
              resp.status(500).send({
                success: false,
                message: err,
              });
            });
        }
      }

      // if previousAmount is zero
      else {
        lastTransaction.theseMonthAmount -= amount;

        await lastTransaction.save().catch((err) => {
          console.log(err);
          resp.status(500).send({
            success: false,
            message: "failed to save transaction",
          });
        });

        const addPaymentDetail = await paymentModel
          .create({
            customerId: req.body.customerId,
            providerId: req.body.providerId,
            amount: req.body.amount,
            date: new Date(),
            modeOfPayment: req.body.modeOfPayment,
          })
          .then(() => {
            resp.status(200).send({
              success: true,
              message: "Payment Details Added Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            resp.status(500).send({
              success: false,
              message: err,
            });
          });
      }
    } else {
      resp.status(200).send({
        success: false,
        message: "Sorry,Any Transaction Not Complete",
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

// it is for paymnet transaction history

const historyOfPayment = async (req, res) => {
  try {
    const year = req.body.year;
    const month = getMonthDigit(req.body.month);

    if (month != 0) {
      const startDate = DateTime.fromObject({ year, month, day: 1 }).toJSDate();
      const endDate = DateTime.fromObject({ year, month, day: 1 })
        .endOf("month")
        .toJSDate();

      const query = {
        providerId: req.body.providerId,
        customerId: req.body.customerId,
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const transactions = await paymentModel.find(query);

      if (transactions.length != 0) {
        res.status(200).send({
          success: true,
          message: "Transaction Found Successfully",
          transactions,
        });
      } else {
        res.status(200).send({
          success: false,
          message: "Transaction Not Found",
        });
      }
    } else {
      const startDate = DateTime.fromObject({
        year,
        month: 1,
        day: 1,
      }).toJSDate();
      const endDate = DateTime.fromObject({
        year,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
      }).toJSDate();

      const query = {
        providerId: req.body.providerId,
        customerId: req.body.customerId,
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const transactions = await paymentModel.find(query);

      if (transactions.length != 0) {
        res.status(200).send({
          success: true,
          message: "Transaction Found Successfully",
          transactions,
        });
      } else {
        res.status(200).send({
          success: false,
          message: "Transaction Not Found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};

// it is for finding the sales information

const getSalesInformation = async (req, resp) => {
  try {
    // it is for total amount of milk
    let totalCow = 0;
    let totalBuffelow = 0;
    let totalOther = 0;
    const year = req.body.year;
    const month = getMonthDigit(req.body.month);

    const price = await milkDetail.findOne({
      providerId: req.body.providerId,
      active: true,
    });

    let cowPrice = 0;
    let buffelowPrice = 0;
    let otherPrice = 0;

    if (price) {
      cowPrice = price.cowPrice;
      buffelowPrice = price.buffelowPrice;
      otherPrice = price.otherPrice;
    }

    if (month != 0) {
      const startDate = DateTime.fromObject({ year, month, day: 1 }).toJSDate();
      const endDate = DateTime.fromObject({ year, month, day: 1 })
        .endOf("month")
        .toJSDate();

      const query = {
        providerId: req.body.providerId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const transactions = await transactionModel.find(query);

      if (transactions.length != 0) {
        for (let index = 0; index < transactions.length; index++) {
          const element = transactions[index];
          totalCow += element.cowMorning + element.cowEvening;
          totalBuffelow += element.buffelowMorning + element.buffelowEvening;
          totalOther += element.otherMorning + element.otherEvening;
        }

        const totalCowSales = totalCow * cowPrice;
        const totalBuffelowSales = totalBuffelow * buffelowPrice;
        const totalOtherSales = totalOther * otherPrice;

        if (price) {
          resp.status(200).send({
            success: true,
            message: "Data found successfully",
            price: true,
            totalCow,
            totalBuffelow,
            totalOther,
            totalCowSales,
            totalBuffelowSales,
            totalOtherSales,
          });
        } else {
          resp.status(200).send({
            success: true,
            price: true,
            message:
              "Data found successfully but You are not add price of milk",
            totalCow,
            totalBuffelow,
            totalOther,
          });
        }
      } else {
        resp.status(200).send({
          success: false,
          message: "Data Not Found",
        });
      }
    } else {
      const startDate = DateTime.fromObject({
        year,
        month: 1,
        day: 1,
      }).toJSDate();
      const endDate = DateTime.fromObject({
        year,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
      }).toJSDate();

      const query = {
        providerId: req.body.providerId,
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const transactions = await transactionModel.find(query);

      if (transactions.length != 0) {
        for (let index = 0; index < transactions.length; index++) {
          const element = transactions[index];
          totalCow += element.cowMorning + element.cowEvening;
          totalBuffelow += element.buffellowMorning + element.buffellowEvening;
          totalOther += element.otherMorning + element.otherEvening;
        }
        const totalCowSales = totalCow * cowPrice;
        const totalBuffelowSales = totalBuffelow * buffelowPrice;
        const totalOtherSales = totalOther * otherPrice;

        if (price) {
          resp.status(200).send({
            success: true,
            message: "Data Found Successfully",
            price: true,
            totalCow,
            totalBuffelow,
            totalOther,
            totalCowSales,
            totalBuffelowSales,
            totalOtherSales,
          });
        } else {
          resp.status(200).send({
            success: true,
            price: true,
            message:
              "Data Found Successfully but You are not add price of milk",
            totalCow,
            totalBuffelow,
            totalOther,
          });
        }
      } else {
        resp.status(200).send({
          success: false,
          message: "Data Not Found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: error,
    });
  }
};

// it is for approve the changes of milk quantity

const approveMilkQuantity = async (req, resp) => {
  try {
    const approveMilkQuantityRequest = await MilkInfoModel.findOne({
      providerId: req.body.providerId,
      customerId: req.body.customerId,
      isApprove: false,
    });

    const removePreviousEntry = await MilkInfoModel.findOneAndDelete({
      providerId: req.body.providerId,
      customerId: req.body.customerId,
      isApprove: true,
    });

    console.log(approveMilkQuantityRequest);
    console.log(removePreviousEntry);
    if (approveMilkQuantityRequest && removePreviousEntry) {
      approveMilkQuantityRequest.isApprove = true;

      await approveMilkQuantityRequest.save();
      resp.status(200).send({
        success: true,
        message: "Milk Quantity Approve Successfully",
      });
    } else {
      resp.status(200).send({
        success: false,
        message: "Sorry,We can't find the request for cahnge. Please try again",
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

// get the customer list whose request to change the milk volume

const customerListToChangeMilkVolume = async (req, res) => {
  try {
    const customerListToRequest = await MilkInfoModel.find({
      providerId: req.body.providerId,
      isApprove: false,
    });

    const customerList = [];
    for (let index = 0; index < customerListToRequest.length; index++) {
      const element = customerListToRequest[index];
      const customer = await CustomerMaster.findById({
        _id: element.customerId,
      });
      customerList.push(customer);
    }

    if (customerList.length != 0) {
      res.status(200).send({
        success: true,
        message: "Customer List",
        customerListToRequest,
        customerList,
      });
    } else {
      res.status(200).send({
        success: false,
        message:
          "Sorry,We can't find the customer whose request to change for milk volume",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};

const findMilkDetails = async (req, resp) => {
  try {
    const customerId = req.body.customerId;
    const providerId = req.body.providerId;

    const milkDetails = await MilkInfoModel.findOne({
      customerId: customerId,
      providerId: providerId,
    });

    if (!milkDetails) {
      resp.status(200).send({
        success: false,
        message: "Failed to find the milk details",
      });
    } else {
      resp.status(200).send({
        success: true,
        message: "Successfully found the milk details",
        milkDetails: milkDetails,
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

module.exports = {
  providerRegistration,
  dissApproveCustomerList,
  isProviderExists,
  customerApprove,
  customerDissApprove,
  getCustomer,
  milkTransaction,
  historyOfCustomer,
  historyOfPayment,
  addCustomerPayment,
  addPrice,
  getSalesInformation,
  customerListToChangeMilkVolume,
  approveMilkQuantity,
  findMilkDetails,
};
