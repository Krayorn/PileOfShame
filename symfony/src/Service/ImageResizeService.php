<?php

namespace App\Service;

use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageResizeService
{
    private readonly ImageManager $imageManager;

    public function __construct(
        private readonly int $maxDimension = 1600
    ) {
        $this->imageManager = new ImageManager(new Driver());
    }

    public function resizeImage(UploadedFile $file): UploadedFile
    {
        $image = $this->imageManager->read($file->getPathname());

        // Auto-rotate based on EXIF orientation data
        $image->orient();

        $width = $image->width();
        $height = $image->height();

        if ($width <= $this->maxDimension && $height <= $this->maxDimension) {
            // Still need to save the image after orient() to apply the rotation
            $tempPath = tempnam(sys_get_temp_dir(), 'oriented_');
            $image->save($tempPath, quality: 85);

            return new UploadedFile(
                $tempPath,
                $file->getClientOriginalName(),
                $file->getMimeType(),
                $file->getError(),
                true
            );
        }

        $image->scaleDown($this->maxDimension);

        $tempPath = tempnam(sys_get_temp_dir(), 'resized_');
        $image->save($tempPath, quality: 85);

        return new UploadedFile(
            $tempPath,
            $file->getClientOriginalName(),
            $file->getMimeType(),
            $file->getError(),
            true
        );
    }
}
