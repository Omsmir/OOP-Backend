export const BufferToString = async (body: any) => {
    return typeof body === 'string' ? Buffer.from(body, 'base64') : body instanceof Blob ? Buffer.from(await body.arrayBuffer()) : Buffer.from(body);
};
