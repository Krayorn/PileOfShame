<?php

namespace App\Collection\Folder;

use App\Collection\Statistics;
use App\Painter\Painter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Folder>
 */
class FolderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Folder::class);
    }

    public function getStats(Folder $folder): Statistics
    {
        $foldersIds = [$folder->getId()->toString(), ...array_map(fn(Folder $folder) => $folder->getId()->toString(), $folder->getFolders()->toArray())];
        $conn = $this->getEntityManager()->getConnection();

        $placeholders = implode(',', array_map(fn($id) => $conn->quote($id), $foldersIds));
        $sql = "
WITH RECURSIVE folder_hierarchy AS (
    -- Base case: Start with all folders (so we compute for every folder)
    SELECT id, id AS root_id
    FROM folders where id IN ($placeholders)

    UNION ALL

    -- Recursive case: Find all subfolders and inherit the root_id
    SELECT f.id, fh.root_id
    FROM folders f
    INNER JOIN folder_hierarchy fh ON f.folder_id = fh.id
)
--SELECT *
SELECT fh.root_id AS folder_id, m.status, SUM(m.count) AS total_count
FROM folder_hierarchy fh
INNER JOIN miniatures m ON m.folder_id = fh.id
GROUP BY fh.root_id, m.status
ORDER BY fh.root_id, m.status
;
            ";

        $stmt = $conn->prepare($sql);
        $res = $stmt->executeQuery();

        return new Statistics($foldersIds, $res->fetchAllAssociative());
    }

    public function getMaxSortOrder(?Folder $parentFolder, Painter $painter): int
    {
        $qb = $this->createQueryBuilder('f')
            ->select('MAX(f.sortOrder) as maxSortOrder')
            ->where('f.painter = :painter')
            ->setParameter('painter', $painter);

        if ($parentFolder === null) {
            $qb->andWhere('f.parentFolder IS NULL');
        } else {
            $qb->andWhere('f.parentFolder = :parentFolder')
               ->setParameter('parentFolder', $parentFolder);
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return $result !== null ? (int) $result : -1;
    }
}
