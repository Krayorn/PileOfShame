<?php

namespace App\Collection\Folder;

use App\Collection\Miniature\Miniature;
use App\Painter\Painter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Table(name: 'folders')]
#[ORM\Entity()]
class Folder
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;

    /**
     * @var Collection<int, Folder>
     */
    #[ORM\OneToMany(mappedBy: 'parentFolder', targetEntity: self::class)]
    private Collection $folders;

    /**
     * @var Collection<int, Miniature>
     */
    #[ORM\OneToMany(mappedBy: 'folder', targetEntity: Miniature::class)]
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
        #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'folders')]
        #[ORM\JoinColumn(
            name: 'folder_id',
            referencedColumnName: 'id',
            nullable: true,
            onDelete: 'CASCADE'
        )]
        private ?self $parentFolder,
        #[ORM\Column(type: 'string')]
        private string $name,
        #[ORM\Column(type: 'integer')]
        private int $sortOrder = 0,
    ) {
        $this->id = Uuid::uuid4();
        $this->folders = new ArrayCollection();
        $this->miniatures = new ArrayCollection();
    }

    public function setParentFolder(?self $parentFolder): void
    {
        $this->parentFolder = $parentFolder;
    }

    public function update(?string $name): void
    {
        if ($name !== null) {
            $this->name = $name;
        }
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return Collection<int, Folder>
     */
    public function getFolders(): Collection
    {
        return $this->folders;
    }

    public function getPainter(): Painter
    {
        return $this->painter;
    }

    public function getParentFolder(): ?self
    {
        return $this->parentFolder;
    }

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): void
    {
        if ($this->sortOrder === $sortOrder) {
            return;
        }

        if ($this->parentFolder instanceof self) {
            $this->parentFolder->reorderChild($this, $sortOrder);
        }
    }

    public function reorderChild(self $child, int $newSortOrder): void
    {
        $oldSortOrder = $child->getSortOrder();

        if ($oldSortOrder === $newSortOrder) {
            return;
        }

        $children = $this->folders->toArray();

        if ($newSortOrder > $oldSortOrder) {
            // Moving down: shift folders between old and new position up by 1
            foreach ($children as $sibling) {
                if ($sibling->getId()->equals($child->getId())) {
                    continue;
                }
                $siblingOrder = $sibling->getSortOrder();
                if ($siblingOrder > $oldSortOrder && $siblingOrder <= $newSortOrder) {
                    $sibling->setSortOrderInternal($siblingOrder - 1);
                }
            }
        } else {
            // Moving up: shift folders between new and old position down by 1
            foreach ($children as $sibling) {
                if ($sibling->getId()->equals($child->getId())) {
                    continue;
                }
                $siblingOrder = $sibling->getSortOrder();
                if ($siblingOrder >= $newSortOrder && $siblingOrder < $oldSortOrder) {
                    $sibling->setSortOrderInternal($siblingOrder + 1);
                }
            }
        }

        $child->setSortOrderInternal($newSortOrder);
    }

    public function normalizeChildrenOrder(): void
    {
        $children = $this->folders->toArray();

        usort($children, fn (Folder $a, Folder $b) => $a->getSortOrder() <=> $b->getSortOrder());

        foreach ($children as $index => $child) {
            $child->setSortOrderInternal($index);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function view(bool $deep = true): array
    {
        $view = [
            'id' => $this->id,
            'name' => $this->name,
            'sortOrder' => $this->sortOrder,
        ];

        if ($deep) {
            $view['parent'] = [
                'id' => $this->parentFolder?->getId(),
                'name' => $this->parentFolder?->getName(),
            ];
            $view['miniatures'] = $this->miniatures->map(fn (Miniature $miniature) => $miniature->view())->toArray();
            $foldersArray = $this->folders->toArray();
            usort($foldersArray, fn (Folder $a, Folder $b) => $a->getSortOrder() <=> $b->getSortOrder());
            $view['folders'] = array_map(fn (Folder $folder) => $folder->view(false), $foldersArray);
        }

        return $view;
    }

    protected function setSortOrderInternal(int $sortOrder): void
    {
        $this->sortOrder = $sortOrder;
    }
}
