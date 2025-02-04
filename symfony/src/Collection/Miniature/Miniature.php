<?php

namespace App\Collection\Miniature;

use App\Painter\Painter;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Table(name: 'miniatures')]
#[ORM\Entity()]
class Miniature
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;
    public function __construct(
        #[ORM\ManyToOne(targetEntity: Painter::class, inversedBy: 'miniatures')]
        #[ORM\JoinColumn(
            name: 'painter_id',
            referencedColumnName: 'id',
            nullable: false,
            onDelete: 'CASCADE'
        )]
        private readonly Painter $painter,
        #[ORM\Column(type: 'string')]
        private readonly string $name,
        #[ORM\Column(enumType: ProgressStatus::class)]
        private readonly ProgressStatus $status,
        #[ORM\Column(type: 'integer')]
        private readonly int $count,
    ) {
        $this->id = Uuid::uuid4();
    }

    public function view(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'count' => $this->count,
        ];
    }
}