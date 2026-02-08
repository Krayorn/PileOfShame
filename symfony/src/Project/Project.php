<?php

namespace App\Project;

use App\Collection\Miniature\Miniature;
use App\Painter\Painter;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Table(name: 'projects')]
#[ORM\Entity()]
class Project
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;

    /**
     * @var Collection<int, Miniature>
     */
    #[ORM\ManyToMany(targetEntity: Miniature::class)]
    #[ORM\JoinTable(name: 'project_miniatures')]
    #[ORM\JoinColumn(name: 'project_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    #[ORM\InverseJoinColumn(name: 'miniature_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private Collection $miniatures;

    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $createdAt;

    public function __construct(
        #[ORM\ManyToOne(targetEntity: Painter::class)]
        #[ORM\JoinColumn(
            name: 'painter_id',
            referencedColumnName: 'id',
            nullable: false,
            onDelete: 'CASCADE'
        )]
        private readonly Painter $painter,
        #[ORM\Column(type: 'string')]
        private string $name,
        #[ORM\Column(type: 'datetime_immutable', nullable: true)]
        private ?DateTimeImmutable $targetDate = null,
    ) {
        $this->id = Uuid::uuid4();
        $this->miniatures = new ArrayCollection();
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getPainter(): Painter
    {
        return $this->painter;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getTargetDate(): ?DateTimeImmutable
    {
        return $this->targetDate;
    }

    public function update(?string $name, ?DateTimeImmutable $targetDate): void
    {
        if ($name !== null) {
            $this->name = $name;
        }
        $this->targetDate = $targetDate;
    }

    /**
     * @return Collection<int, Miniature>
     */
    public function getMiniatures(): Collection
    {
        return $this->miniatures;
    }

    public function addMiniature(Miniature $miniature): void
    {
        if (! $this->miniatures->contains($miniature)) {
            $this->miniatures->add($miniature);
        }
    }

    public function removeMiniature(Miniature $miniature): void
    {
        $this->miniatures->removeElement($miniature);
    }

    /**
     * @return array<string, mixed>
     */
    public function view(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'targetDate' => $this->targetDate?->format(DateTimeInterface::ATOM),
            'miniatures' => $this->miniatures->map(fn (Miniature $miniature) => $miniature->view())->toArray(),
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
        ];
    }
}
