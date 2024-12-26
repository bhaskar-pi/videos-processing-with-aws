import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import {v4 as uuid} from 'uuid'

dotenv.config()

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const EVENTS_BUCKET_NAME = process.env.AWS_LAMBDA_EVENTS_BUCKET_NAME || ''

const S3 = new AWS.S3()

const uploadText = async(data: any) => {
    try {
        if (data){
            const params = {
                Bucket: EVENTS_BUCKET_NAME,
                Key: `event_${data.fileName}_${uuid()}`,
                ContentType: 'application/json',
                Body: JSON.stringify(data)
            }
        
            await S3.upload(params).promise()
            console.log('File uploaded succeslyy to', EVENTS_BUCKET_NAME )
        }
    } catch (error) {
        console.log('Error in uploadText to s3 ', error)
    }
}

export const publishEvent = async(data: any) => {
    await uploadText(data)
}
