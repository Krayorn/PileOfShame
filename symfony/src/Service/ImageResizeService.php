<?php

namespace App\Service;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageResizeService
{
    private ImageManager $imageManager;
    private int $maxDimension;

    public function __construct(int $maxDimension = 1600)
    {
        $this->imageManager = new ImageManager(new Driver());
        $this->maxDimension = $maxDimension;
    }

    public function resizeImage(UploadedFile $file): UploadedFile
    {
        $image = $this->imageManager->read($file->getPathname());
        
        $width = $image->width();
        $height = $image->height();
        
        if ($width <= $this->maxDimension && $height <= $this->maxDimension) {
            return $file;
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
