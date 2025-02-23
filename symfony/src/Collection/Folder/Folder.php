<?php

namespace App\Collection\Folder;

use App\Collection\Miniature\Miniature;
use App\Painter\Painter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\Collection;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Table(name: 'folders')]
#[ORM\Entity()]
class Folder
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;
    
    #[ORM\OneToMany(targetEntity: Folder::class, mappedBy: 'parentFolder')]
    private Collection $folders;

    #[ORM\OneToMany(targetEntity: Miniature::class, mappedBy: 'folder')]
    private Collection $miniatures;

    public function __construct(
        #[ORM\ManyToOne(targetEntity: Painter::class, inversedBy: 'folders')]
        #[ORM\JoinColumn(
            name: 'painter_id',
            referencedColumnName: 'id',
            nullable: false,
            onDelete: 'CASCADE'
        )]
        private readonly Painter $painter,
        #[ORM\ManyToOne(targetEntity: Folder::class, inversedBy: 'folders')]
        #[ORM\JoinColumn(
            name: 'folder_id',
            referencedColumnName: 'id',
            nullable: true,
            onDelete: 'CASCADE'
        )]
        private ?Folder $parentFolder,
        #[ORM\Column(type: 'string')]
        private string $name,
    ) {
        $this->id = Uuid::uuid4();
        $this->folders = new ArrayCollection();
        $this->miniatures = new ArrayCollection();
    }

    public function setParentFolder(?Folder $parentFolder): void
    {
        $this->parentFolder = $parentFolder;
    }

    public function view(bool $deep = true): array {
        $view = [
            'id' => $this->id,
            'name' => $this->name,
        ];

        if ($deep) {
            $view['miniatures'] = $this->miniatures->map(fn (Miniature $miniature) => $miniature->view())->toArray();
            $view['folders'] = $this->folders->map(fn (Folder $folder) => $folder->view(false))->toArray();
        }

        return $view;
    }
}