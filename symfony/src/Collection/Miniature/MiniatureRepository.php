<?php

namespace App\Collection\Miniature;

use App\Painter\Painter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Miniature>
 */
class MiniatureRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Miniature::class);
    }

    /**
     * @return Miniature[]
     */
    public function search(Painter $painter, string $query): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.painter = :painter')
            ->andWhere('m.name LIKE :query')
            ->setParameter('painter', $painter)
            ->setParameter('query', '%' . $query . '%')
            ->setMaxResults(20)
            ->getQuery()
            ->getResult();
    }

    public function findRandomUnpainted(Painter $painter): ?Miniature
    {
        $results = $this->createQueryBuilder('m')
            ->where('m.painter = :painter')
            ->andWhere('m.status != :painted')
            ->setParameter('painter', $painter)
            ->setParameter('painted', ProgressStatus::Painted)
            ->getQuery()
            ->getResult();

        if ($results === []) {
            return null;
        }

        return $results[array_rand($results)];
    }

    /**
     * @param list<string> $miniatureIds
     */
    public function findRandomUnpaintedFromIds(Painter $painter, array $miniatureIds): ?Miniature
    {
        $results = $this->createQueryBuilder('m')
            ->where('m.painter = :painter')
            ->andWhere('m.status != :painted')
            ->andWhere('m.id IN (:ids)')
            ->setParameter('painter', $painter)
            ->setParameter('painted', ProgressStatus::Painted)
            ->setParameter('ids', $miniatureIds)
            ->getQuery()
            ->getResult();

        if ($results === []) {
            return null;
        }

        return $results[array_rand($results)];
    }
}
