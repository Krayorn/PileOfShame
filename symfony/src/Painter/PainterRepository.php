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
     * @return array<int, array<string, mixed>>
     */
    public function getAllUsersStatistics(): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // Get all users
        $users = $this->findAll();

        if (empty($users)) {
            return [];
        }

        // Get folder counts grouped by painter_id
        $foldersCounts = $conn->executeQuery(
            'SELECT painter_id, COUNT(*) as count FROM folders GROUP BY painter_id'
        )->fetchAllAssociative();

        // Get miniature counts grouped by painter_id
        $miniaturesCounts = $conn->executeQuery(
            'SELECT painter_id, COUNT(*) as count FROM miniatures GROUP BY painter_id'
        )->fetchAllAssociative();

        // Get picture counts grouped by painter_id (via miniatures)
        $picturesCounts = $conn->executeQuery(
            'SELECT m.painter_id, COUNT(*) as count 
             FROM pictures p 
             INNER JOIN miniatures m ON p.miniature_id = m.id 
             GROUP BY m.painter_id'
        )->fetchAllAssociative();

        // Convert to associative arrays keyed by painter_id for quick lookup
        $foldersMap = [];
        foreach ($foldersCounts as $row) {
            $foldersMap[$row['painter_id']] = (int) $row['count'];
        }

        $miniaturesMap = [];
        foreach ($miniaturesCounts as $row) {
            $miniaturesMap[$row['painter_id']] = (int) $row['count'];
        }

        $picturesMap = [];
        foreach ($picturesCounts as $row) {
            $picturesMap[$row['painter_id']] = (int) $row['count'];
        }

        // Combine results
        $result = [];
        foreach ($users as $painter) {
            $painterId = $painter->getId()->toString();
            $result[] = [
                'id' => $painter->getId(),
                'username' => $painter->getUserIdentifier(),
                'isAdmin' => $painter->isAdmin(),
                'foldersCount' => $foldersMap[$painterId] ?? 0,
                'miniaturesCount' => $miniaturesMap[$painterId] ?? 0,
                'picturesCount' => $picturesMap[$painterId] ?? 0,
            ];
        }

        return $result;
    }
}
