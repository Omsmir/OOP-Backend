import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_KEY } from '@/config/defaults';
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger';

interface UploadParams {
    Directory: S3_DIRECTORIES;
    Key: string;
    Body: Buffer | Uint8Array | Blob | string;
    ContentType:
        | 'application/json'
        | 'image/png'
        | 'image/jpeg'
        | 'video/mp4'
        | 'application/pdf'
        | string;
}

export enum S3_DIRECTORIES {
    PROFILE_PICTURES = 'profile-pictures/',
}



export enum S3_EVENT_TYPE {
    UPLOAD = 'upload',
    DELETE = 'delete',
}

class S3 {
    private static instance: S3;
    private readonly s3Client: S3Client;
    private constructor() {
        this.s3Client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: String(AWS_ACCESS_KEY),
                secretAccessKey: String(AWS_SECRET_KEY),
            },
        });
        this.listen();
    }

    public static getInstance(): S3 {
        if (!S3.instance) {
            S3.instance = new S3();
        }
        return S3.instance;
    }

    private listen = () => {
        logger.info('S3 Service has been initialized');
    };

    public getS3Client = async (): Promise<S3Client> => {
        return this.s3Client;
    };
}

export class S3Services {
    constructor(private readonly s3: S3) {}

    private eject_file = ({ Key, Directory, Body, ContentType }: UploadParams) => {
        const command = new PutObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: `${Directory}${Key}`,
            Body,
            ContentType,
        });
        return command;
    };

    private delete_file = (Key: string, Directory: S3_DIRECTORIES) => {
        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: `${Directory}${Key}`,
        });
        return command;
    };

    

    public uploadFile = async (params: UploadParams) => {
        try {
            const command = this.eject_file(params);
            if (!command) {
                throw new Error('S3 command is not initialized. Call upload() first.');
            }
            const s3 = await this.s3.getS3Client();

            const result = await s3.send(command);

            if (result.$metadata.httpStatusCode !== 200) {
                throw new Error(
                    `Failed to upload file to AWS S3: ${result.$metadata.httpStatusCode}`
                );
            }

            logger.info(`Uploading file with name ${command.input.Key} to S3`);

            const url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${command.input.Key}`;

            return url;
        } catch (error: any) {
            logger.error(`Error uploading file to S3: ${error.message}`);
            console.log(error.message);
        }
    };
}
export default S3;
