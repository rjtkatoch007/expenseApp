const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadFileToS3 = async (fileBuffer, key) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: "text/csv",
        ContentDisposition: `attachment; filename="${key.split("/").pop()}"`
    });

    await s3Client.send(command);

    return key;
};

const generateDownloadUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        ResponseContentType: "text/csv",
        ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`
    });

    // URL will remain valid for 1 hour
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    });

    return url;
};

module.exports = {
    uploadFileToS3,
    generateDownloadUrl
};