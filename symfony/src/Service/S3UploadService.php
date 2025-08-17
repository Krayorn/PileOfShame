<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class S3UploadService
{
    private S3Client $s3Client;
    private string $bucket;
    private string $region;

    public function __construct(
        string $s3Endpoint,
        string $s3AccessKey,
        string $s3SecretKey,
        string $s3Bucket,
        string $s3Region = 'auto'
    ) {
        $this->bucket = $s3Bucket;
        $this->region = $s3Region;

        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => $this->region,
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
        $result = $this->s3Client->putObject([
            'Bucket' => $this->bucket,
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
                'Bucket' => $this->bucket,
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
        return $this->bucket;
    }
}
