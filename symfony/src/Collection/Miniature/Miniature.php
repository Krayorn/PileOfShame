<?php

namespace App\Collection\Miniature;

use App\Collection\Folder\Folder;
use App\Collection\Miniature\Picture\Picture;
use App\Painter\Painter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;
use DateTimeImmutable;
use DateTimeInterface;

#[ORM\Table(name: 'miniatures')]
#[ORM\Entity()]
class Miniature
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;
    
    #[ORM\OneToMany(targetEntity: Picture::class, mappedBy: 'miniature', cascade: ['persist', 'remove'])]
    private Collection $pictures;
    

    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $paintedAt;

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
        $this->pictures = new ArrayCollection();

        $this->createdAt = new DateTimeImmutable();
        $this->paintedAt = null;
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getPainter(): Painter
    {
        return $this->painter;
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
            if ($this->status !== $status && $status === ProgressStatus::Painted) {
                $this->paintedAt = new DateTimeImmutable();
            }

            if ($status !== ProgressStatus::Painted) {
                $this->paintedAt = null;
            }
            $this->status = $status;
        }
    }

    public function getPictures(): Collection
    {
        return $this->pictures;
    }

    public function addPicture(Picture $picture): void
    {
        if (!$this->pictures->contains($picture)) {
            $this->pictures->add($picture);
        }
    }

    public function view(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'count' => $this->count,
            'pictures' => $this->pictures->map(fn(Picture $picture) => $picture->view())->toArray(),
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
            'paintedAt' => $this->paintedAt?->format(DateTimeInterface::ATOM),
        ];
    }
}