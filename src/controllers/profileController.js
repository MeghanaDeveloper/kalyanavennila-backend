const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../utilities/awsConfig");
const { userDetailsModel } = require("../models/userSchema");

//upload profile image
const uploadProfileImage = async (req, res) => {
    const { email } = req.userDetails;
    console.log(email)
    const filePath = req.file
    try {
        console.log("Uploaded File Details:", req.file);
        console.log("Uploaded", filePath);
        if (!filePath) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const user = await userDetailsModel.findOne({email});
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        user.profilePic = req.file.location; 
        await user.save();

        res.json({ message: "Profile picture uploaded successfully!", profilePic: req.file.location });
    } catch (error) {
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
};

//update profile image
const updateProfileImage = async (req, res) => {
    const { email } = req.userDetails;
    try {
        console.log("Uploaded File Details:", req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (user.profilePic) {
            const oldKey = user.profilePic.split(".com/")[1]; 
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: oldKey
            }));
        }

        user.profilePic = req.file.location;
        await user.save();

        res.json({ message: "Profile picture updated successfully!", profilePic: req.file.location });
    } catch (error) {
        res.status(500).json({ error: "Update failed", details: error.message });
    }
};

//delete profile image
const deleteProfileImage = async (req, res) => {
    const { email } = req.userDetails;
    try {
        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (!user.profilePic) {
            return res.status(404).json({ error: "No profile picture found!" });
        }

        const fileKey = user.profilePic.split(".com/")[1]; 
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey
        }));


        user.profilePic = "";
        await user.save();

        res.json({ message: "Profile picture deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
};

//documents
//upload 
const uploadDocuments = async (req, res) => {
    const { email } = req.userDetails;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No documents uploaded" });
        }

        const user = await userDetailsModel.findOne({email});
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        const documentUrls = req.files.map(file => file.location); 
        if (documentUrls.length === 0) {
            return res.status(400).json({ error: "Invalid document URLs generated." });
        }

        user.documents = [...(user.documents || []), ...documentUrls];
        await user.save();
        res.json({ message: "Documents uploaded successfully!", documentUrls });
    } catch (error) {
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
};

//update profile image
const updateDocuments = async (req, res) => {
    const { email } = req.userDetails;
    try {
        console.log("Uploaded File Details:", req.files);
        if (!req.files) {
            return res.status(400).json({ error: "No documents uploaded" });
        }

        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (user.documents && user.documents.length > 0) {
            for (const docUrl of user.documents) {
                const oldKey = docUrl.split(".com/")[1]; 
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: oldKey
                }));
                console.log("Deleted Old Document:", oldKey);
            }
        }

        const documentUrls = req.files.map(file => file.location); 
        user.documents = documentUrls;

        await user.save();

        res.json({ message: "Documents updated successfully!", documents: documentUrls });
    } catch (error) {
        res.status(500).json({ error: "Update failed", details: error.message });
    }
};

// //delete profile image
const deleteDocuments = async (req, res) => {
    const { email } = req.userDetails;

    try {
        const user = await userDetailsModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "This Email address is not registered. Please sign up first!" });
        }

        if (!user.documents || user.documents.length === 0) {
            return res.status(404).json({ error: "No documents found!" });
        }

        for (const docUrl of user.documents) {
            const fileKey = docUrl.split(".com/")[1]; 
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileKey
            }));
            console.log("Deleted Document from S3:", fileKey);
        }

        user.documents = [];
        await user.save();

        res.json({ message: "All documents deleted successfully!" });

    } catch (error) {
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
};



module.exports = {
    uploadProfileImage,
    updateProfileImage,
    deleteProfileImage,
    uploadDocuments,
    updateDocuments,
    deleteDocuments
}