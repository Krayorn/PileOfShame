<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class S3UploadService
{
    private readonly S3Client $s3Client;

    public function __construct(
        string $s3Endpoint,
        string $s3AccessKey,
        string $s3SecretKey,
        private readonly string $s3Bucket,
        private readonly string $s3Region = 'auto'
    ) {
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => $this->s3Region,
            'endpoint' => $s3Endpoint,
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => $s3AccessKey,
                'secret' => $s3SecretKey,
            ],
        ]);
    }

    public function uploadFile(UploadedFile $file, string $path): string
    {
        $this->s3Client->putObject([
            'Bucket' => $this->s3Bucket,
            'Key' => $path,
            'Body' => fopen($file->getPathname(), 'r'),
            'ContentType' => $file->getMimeType(),
            'ACL' => 'public-read',
        ]);

        return $path;
    }

    public function deleteFile(string $path): void
    {
        try {
            $this->s3Client->deleteObject([
                'Bucket' => $this->s3Bucket,
                'Key' => $path,
            ]);
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public function generatePath(string $miniatureId, string $filename): string
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $uniqueName = uniqid() . '_' . time() . '.' . $extension;
        return "miniatures/{$miniatureId}/{$uniqueName}";
    }

    public function getS3Endpoint(): string
    {
        return $this->s3Client->getEndpoint();
    }

    public function getS3Bucket(): string
    {
        return $this->s3Bucket;
    }
}
