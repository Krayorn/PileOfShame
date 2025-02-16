<?php

namespace App\Collection\Miniature;

use App\Collection\Folder\Folder;
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
        private string $name,
        #[ORM\Column(enumType: ProgressStatus::class)]
        private ProgressStatus $status,
        #[ORM\Column(type: 'integer')]
        private int $count,
        #[ORM\ManyToOne(targetEntity: Folder::class, inversedBy: 'miniatures')]
        #[ORM\JoinColumn(
            name: 'folder_id',
            referencedColumnName: 'id',
            nullable: false,
            onDelete: 'CASCADE'
        )]
        private Folder $folder,
    ) {
        $this->id = Uuid::uuid4();
    }

    public function setFolder(Folder $folder): void {
        $this->folder = $folder;
    }

    public function update(?string $name, ?int $count, ?ProgressStatus $status): void {
        if ($name !== null) {
            $this->name = $name;
        }
        if ($count !== null) {
            $this->count = $count;
        }
        if ($status !== null) {
            $this->status = $status;
        }
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