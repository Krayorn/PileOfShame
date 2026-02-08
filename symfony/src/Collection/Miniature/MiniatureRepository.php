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
}
