<?php

namespace App\Collection\Miniature\Picture;

use App\Collection\Miniature\Miniature;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Table(name: 'pictures')]
#[ORM\Entity()]
class Picture
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;
    
    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $uploadedAt;

    #[ORM\Column(type: 'integer')]
    private int $rotation = 0;

    public function __construct(
        #[ORM\ManyToOne(targetEntity: Miniature::class, inversedBy: 'pictures')]
        #[ORM\JoinColumn(
            name: 'miniature_id',
            referencedColumnName: 'id',
            nullable: false,
            onDelete: 'CASCADE'
        )]
        private readonly Miniature $miniature,
        #[ORM\Column(type: 'string')]
        private string $path,
        #[ORM\Column(type: 'string')]
        private string $s3Endpoint,
        #[ORM\Column(type: 'string')]
        private string $s3Bucket,
    ) {
        $this->id = Uuid::uuid4();
        $this->uploadedAt = new DateTimeImmutable();
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getMiniature(): Miniature
    {
        return $this->miniature;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function setPath(string $path): void
    {
        $this->path = $path;
    }

    public function getRotation(): int
    {
        return $this->rotation;
    }

    public function setRotation(int $rotation): void
    {
        // Ensure rotation is one of the valid values: 0, 90, 180, 270
        $validRotations = [0, 90, 180, 270];
        if (!in_array($rotation, $validRotations, true)) {
            throw new \InvalidArgumentException('Rotation must be 0, 90, 180, or 270 degrees');
        }
        $this->rotation = $rotation;
    }

    public function view(): array
    {
        return [
            'id' => $this->id,
            'path' => $this->path,
            'uploadedAt' => $this->uploadedAt->format(DateTimeInterface::ATOM),
            'rotation' => $this->rotation,
        ];
    }
}
