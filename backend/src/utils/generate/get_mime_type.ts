import path from 'path'
export function getMimeType(filename: string) {
    const ext = path.extname(filename).toLowerCase();

    switch (ext) {
        // --- Images ---
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        case ".bmp":
            return "image/bmp";
        case ".tiff":
        case ".tif":
            return "image/tiff";
        case ".svg":
            return "image/svg+xml";
        case ".ico":
            return "image/x-icon";
        case ".heic":
            return "image/heic";
        case ".heif":
            return "image/heif";

        // --- Videos ---
        case ".mp4":
            return "video/mp4";
        case ".mov":
            return "video/quicktime";
        case ".avi":
            return "video/x-msvideo";
        case ".mkv":
            return "video/x-matroska";
        case ".webm":
            return "video/webm";
        case ".flv":
            return "video/x-flv";
        case ".wmv":
            return "video/x-ms-wmv";
        case ".m4v":
            return "video/x-m4v";

        // --- Audio ---
        case ".mp3":
            return "audio/mpeg";
        case ".wav":
            return "audio/wav";
        case ".ogg":
            return "audio/ogg";
        case ".m4a":
            return "audio/mp4";
        case ".aac":
            return "audio/aac";
        case ".flac":
            return "audio/flac";
        // --- Documents ---
        case ".pdf":
            return "application/pdf";
        case ".doc":
            return "application/msword";
        case ".docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case ".xls":
            return "application/vnd.ms-excel";
        case ".xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case ".ppt":
            return "application/vnd.ms-powerpoint";
        case ".pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case ".txt":
            return "text/plain";
        case ".csv":
            return "text/csv";
        case ".rtf":
            return "application/rtf";
        case ".odt":
            return "application/vnd.oasis.opendocument.text";
        case ".ods":
            return "application/vnd.oasis.opendocument.spreadsheet";
        case ".odp":
            return "application/vnd.oasis.opendocument.presentation";
        case ".epub":
            return "application/epub+zip";

        // --- Archives ---
        case ".zip":
            return "application/zip";
        case ".rar":
            return "application/vnd.rar";
        case ".7z":
            return "application/x-7z-compressed";
        case ".tar":
            return "application/x-tar";
        case ".gz":
            return "application/gzip";
        case ".bz2":
            return "application/x-bzip2";

        // --- Code / Text / Web ---
        case ".html":
            return "text/html";
        case ".htm":
            return "text/html";
        case ".css":
            return "text/css";
        case ".js":
            return "application/javascript";
        case ".mjs":
            return "application/javascript";
        case ".ts":
            return "application/typescript";
        case ".tsx":
            return "application/x-typescript";
        case ".json":
            return "application/json";
        case ".xml":
            return "application/xml";
        case ".yaml":
        case ".yml":
            return "application/x-yaml";
        case ".md":
            return "text/markdown";
        case ".sh":
            return "application/x-sh";
        case ".c":
            return "text/x-c";
        case ".cpp":
            return "text/x-c++";
        case ".py":
            return "text/x-python";
        case ".java":
            return "text/x-java-source";
        case ".php":
            return "application/x-httpd-php";
        case ".go":
            return "text/x-go";
        case ".rs":
            return "text/x-rustsrc";

        // --- Fonts ---
        case ".ttf":
            return "font/ttf";
        case ".otf":
            return "font/otf";
        case ".woff":
            return "font/woff";
        case ".woff2":
            return "font/woff2";
        case ".eot":
            return "application/vnd.ms-fontobject";

        default:
            return "application/octet-stream";
    }
}
