// const dotenv = require("dotenv");
// const bcrypt = require("bcrypt");
// const otpGenerator = require("otp-generator");
// dotenv.config();
// const JWT_SECRET = process.env.JWT_SECRET;

// // requiring models
// const { User, Handyman, Otp, Notification } = require("../models/model");
// // requiring controllers
// const { sendJobStartOtpMail } = require("./mailController");

// // route - http://localhost:8080/api/createnotification
// const createNotification = async (req, res) => {
//     const { lat, long, user_id, handyman_id } = req.body;

//     const newNotification = new Notification({
//         lat,
//         long,
//         user_id,
//         handyman_id,
//         status: "pending",
//     });

//     await newNotification
//         .save()
//         .then((notification) => {
//             console.log("Notification added");
//             res.status(201).json(notification);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).json({ error: error.message });
//         });
// };

// // route - http://localhost:8080/api/getnotification
// const getNotificationsByHandyman = async (req, res) => {
//     const handyman_id = req.body.handyman_id;
//     try {
//         const notification = await Notification.find({ handyman_id });
//         res.status(200).json(notification);
//     } catch (error) {
//         res.status(404).json({ msg: error.message });
//     }
//     // TODO try doing the below notification search is now working
//     // Notification.find({ handyman_id: handyman_id }, async function (err, docs) {
//     //     if (err) {
//     //         console.log(err);
//     //         res.status(400).send({ msg: "No such handyman exists" });
//     //     } else {
//     //         res.status(200).send(docs[0]);
//     //     }
//     // });
// };

// // route - http://localhost:8080/api/acceptnotification
// const acceptRequest = async (req, res) => {
//     try {
//         const handyman_id = req.body.handyman_id;
//         const notification = await Notification.findOneAndUpdate(
//             { handyman_id, status: "pending" },
//             { status: "accepted" },
//             { new: true }
//         );
//         if (!notification) {
//             return res.status(404).json({
//                 message: "Notification not found or already processed",
//             });
//         }
//         // add user to handyman's usersSelected array
//         console.log("in request accepted");
//         const user_selected = await User.findOne({
//             user_id: notification.user_id,
//         });
//         console.log(user_selected);

//         // sending otp
//         //clearing otp auth table
//         const Email = user_selected.email;
//         try {
//             await Otp.deleteMany({ email: Email }, function (err) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log("Otp deleted successfully");
//                 }
//             });
//         } catch (e) {
//             console.log(e);
//         }

//         // generate otp for new handyman
//         const OTP = otpGenerator.generate(6, {
//             digits: true,
//             upperCaseAlphabets: false,
//             specialChars: false,
//             lowerCaseAlphabets: false,
//         });

//         const otp = {
//             email: Email,
//             otp: OTP,
//         };
//         console.log("Before hashing: ", otp);

//         sendJobStartOtpMail(Email, otp.otp);

//         //encrypting the otp and then saving to Otp_table
//         const salt = await bcrypt.genSalt(10);
//         otp.otp = await bcrypt.hash(otp.otp, salt);

//         const newJobStartOtp = new Otp({
//             email: otp.email,
//             otp: otp.otp,
//         });

//         newJobStartOtp.save((error, success) => {
//             if (error) console.log(error);
//             else console.log("Saved::otp::ready for validation");
//         });

//         return res.status(200).send({ msg: "Otp sent successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // route - http://localhost:8080/api/rejectnotification
// const rejectRequest = async (req, res) => {
//     try {
//         const handyman_id = req.body.handyman_id;
//         const notification = await Notification.findOneAndUpdate(
//             { handyman_id, status: "pending" },
//             { status: "rejected" },
//             { new: true }
//         );
//         if (!notification) {
//             return res.status(404).json({
//                 message: "Notification not found or already processed",
//             });
//         }
//         res.json(notification);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // route - http://localhost:8080/api/workdonecheck
// const workDoneCheck = async (req, res) => {
//     const handyman_id = req.body.handyman_id;
//     const user_id = req.body.user_id;
//     try {
//         const handyman = await Handyman.updateOne(
//             { handyman_id },
//             {
//                 $push: {
//                     usersSelected: await User.findOne({
//                         user_id: user_id,
//                     }),
//                 },
//             }
//         ).populate("usersSelected");
//         // console.log(handyman);
//         res.status(200).json({handyman, msg: "User added successfully"});
//     } catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };

// module.exports = {
//     createNotification,
//     getNotificationsByHandyman,
//     acceptRequest,
//     rejectRequest,
//     workDoneCheck,
// };












const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
dotenv.config();

const { User, Handyman, Otp, Notification } = require("../models/model");
const { sendJobStartOtpMail } = require("./mailController");

// ✅ CREATE NOTIFICATION
const createNotification = async (req, res) => {
    try {
        const { lat, long, user_id, handyman_id } = req.body;

        // ✅ validation
        if (!lat || !long || !user_id || !handyman_id) {
            return res.status(400).json({
                success: false,
                msg: "Missing required fields",
            });
        }

        const notification = await Notification.create({
            lat,
            long,
            user_id,
            handyman_id,
            status: "pending",
        });

        console.log("Notification added");

        return res.status(201).json({
            success: true,
            data: notification,
        });

    } catch (error) {
        console.error("Create Notification Error:", error.message);

        return res.status(500).json({
            success: false,
            msg: "Server error",
        });
    }
};

// ✅ GET LATEST NOTIFICATION ONLY
const getNotificationsByHandyman = async (req, res) => {
    try {
        const { handyman_id } = req.body;

        if (!handyman_id) {
            return res.status(200).json([]);
        }

        const notification = await Notification.find({ handyman_id })
            .sort({ createdAt: -1 }) // latest first
            .limit(1); // only latest

        return res.status(200).json(notification || []);

    } catch (error) {
        console.error("Get Notification Error:", error.message);
        return res.status(500).json([]);
    }
};

// ✅ ACCEPT REQUEST
const acceptRequest = async (req, res) => {
    try {
        const { handyman_id } = req.body;

        const notification = await Notification.findOneAndUpdate(
            { handyman_id, status: "pending" },
            { status: "accepted" },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                msg: "No pending request",
            });
        }

        console.log("Request accepted");

        const user_selected = await User.findOne({
            user_id: notification.user_id,
        });

        if (!user_selected) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        const Email = user_selected.email;

        // delete old OTPs
        await Otp.deleteMany({ email: Email });

        // generate OTP
        const OTP = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        console.log("Generated OTP:", OTP);

        // send email
        sendJobStartOtpMail(Email, OTP);

        // hash OTP
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(OTP, salt);

        // save OTP
        await Otp.create({
            email: Email,
            otp: hashedOtp,
        });

        return res.status(200).json({
            success: true,
            msg: "Request accepted & OTP sent",
        });

    } catch (error) {
        console.error("Accept Request Error:", error.message);

        return res.status(500).json({
            success: false,
            msg: "Server error",
        });
    }
};

// ✅ REJECT REQUEST
const rejectRequest = async (req, res) => {
    try {
        const { handyman_id } = req.body;

        const notification = await Notification.findOneAndUpdate(
            { handyman_id, status: "pending" },
            { status: "rejected" },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                msg: "No pending request",
            });
        }

        return res.status(200).json({
            success: true,
            data: notification,
        });

    } catch (error) {
        console.error("Reject Error:", error.message);

        return res.status(500).json({
            success: false,
            msg: "Server error",
        });
    }
};

// ✅ WORK DONE CHECK
const workDoneCheck = async (req, res) => {
    try {
        const { handyman_id, user_id } = req.body;

        if (!handyman_id || !user_id) {
            return res.status(400).json({
                success: false,
                msg: "Missing fields",
            });
        }

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        await Handyman.updateOne(
            { handyman_id },
            { $push: { usersSelected: user } }
        );

        return res.status(200).json({
            success: true,
            msg: "User added successfully",
        });

    } catch (error) {
        console.error("Work Done Error:", error.message);

        return res.status(500).json({
            success: false,
            msg: "Server error",
        });
    }
};

module.exports = {
    createNotification,
    getNotificationsByHandyman,
    acceptRequest,
    rejectRequest,
    workDoneCheck,
};