const express = require("express");
const {
  userIdentification,
  customerRegistration,
  editProfile,
  addProvider,
  getProvider,
  cardDetail,
  cardDetails,
  changeVolumeOfMilk,
  changeMilkQuality,
} = require("../controller/customerController");

const router = express.Router();

// USER IDENTIFICATION
router.post("/userIdentification", userIdentification);

// REGISTER || POST
router.post("/customerRegistration", customerRegistration);

// EDIT PROFILE || POST
router.post("/editProfile", editProfile);

// ADD PROVIDER || POST
router.post("/addProvider", addProvider);

// GET ALL PROVIDER || POST
router.post('/getProvider',getProvider)

// GET CARD DETAILS || POST

router.post("/cardDetails", cardDetails);

// IT IS FOR CHANGING THE VOLUME OF MILK || POST
  router.post("/changeMilkQuality",changeMilkQuality);

  // IT IS FOR sending the message to
  

module.exports = router;


