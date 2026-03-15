import { Storage } from '@google-cloud/storage';

function getStorage() {
    return new Storage({
        keyFilename: process.env.GCS_KEY_FILE,
    });
}

function getBucket() {
    return getStorage().bucket(process.env.GCS_BUCKET_NAME!);
}

export async function uploadResume(buffer: Buffer, filePath: string): Promise<string> {
    const file = getBucket().file(filePath);
    await file.save(buffer, { contentType: 'application/pdf' });
    await file.makePublic();
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filePath}`;
}

export async function uploadLogo(buffer: Buffer, filePath: string, contentType: string): Promise<string> {
    const file = getBucket().file(filePath);
    await file.save(buffer, { contentType });
    await file.makePublic();
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filePath}`;
}
