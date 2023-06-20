import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import env from "dotenv"

env.config()
const bucket = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
})

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});

export default class ImagesController{
    static async getImage(id){
        let success
        try{
            success = await bucket.send(new GetObjectCommand({Bucket: process.env.BUCKET_NAME, Key: id}))
        }
        catch(e){
            return false
        }
        const base64String = await streamToString(success.Body)
        return {data: base64String}
    }

    static async putImage(id, imageString){
        let currentImage = this.getImage(id)
        let success
        if (currentImage){
            try{
                success = await bucket.send(new DeleteObjectCommand({Bucket: process.env.BUCKET_NAME, Key: id}))
            }
            catch(e){
                return false
            }
            if (!success) return false
        }
        try{
            success = await bucket.send(new PutObjectCommand({Bucket: process.env.BUCKET_NAME, Key: id, Body: imageString}))
        }
        catch(e){
            return false
        }
        return success
    }

    static async deleteImage(id){
        try{
            await bucket.send(new DeleteObjectCommand({Bucket: process.env.BUCKET_NAME, Key: id}))
        }
        catch(e){}
    }
}