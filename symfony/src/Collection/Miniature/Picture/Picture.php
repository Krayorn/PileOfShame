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

    public function view(): array
    {
        return [
            'id' => $this->id,
            'path' => $this->path,
            'uploadedAt' => $this->uploadedAt->format(DateTimeInterface::ATOM),
        ];
    }
}
