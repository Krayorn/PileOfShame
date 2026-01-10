<?php

namespace App\Painter;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Painter>
 */
class PainterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Painter::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function getUserStatistics(Painter $painter): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $painterId = $painter->getId()->toString();

        // Count folders
        $foldersCount = $conn->executeQuery(
            'SELECT COUNT(*) FROM folders WHERE painter_id = ?',
            [$painterId]
        )->fetchOne();

        // Count miniatures
        $miniaturesCount = $conn->executeQuery(
            'SELECT COUNT(*) FROM miniatures WHERE painter_id = ?',
            [$painterId]
        )->fetchOne();

        // Count pictures
        $picturesCount = $conn->executeQuery(
            'SELECT COUNT(*) FROM pictures p 
             INNER JOIN miniatures m ON p.miniature_id = m.id 
             WHERE m.painter_id = ?',
            [$painterId]
        )->fetchOne();

        return [
            'id' => $painter->getId(),
            'username' => $painter->getUserIdentifier(),
            'isAdmin' => $painter->isAdmin(),
            'foldersCount' => (int) $foldersCount,
            'miniaturesCount' => (int) $miniaturesCount,
            'picturesCount' => (int) $picturesCount,
        ];
    }
}
