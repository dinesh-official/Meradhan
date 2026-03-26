
export interface IFileUploadProvider {
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}
