<?php

namespace App\Admin;

use App\Painter\PainterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AdminController extends AbstractController
{
    #[Route('/api/admin/users', methods: 'GET')]
    public function getUsers(PainterRepository $painterRepository): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $usersData = $painterRepository->getAllUsersStatistics();

        return new JsonResponse($usersData, Response::HTTP_OK);
    }

    #[Route('/api/admin/stats', methods: 'GET')]
    public function getGlobalStats(EntityManagerInterface $em): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $conn = $em->getConnection();

        $totalUsers = (int) $conn->executeQuery('SELECT COUNT(*) FROM painter')->fetchOne();
        $totalMiniatures = (int) $conn->executeQuery('SELECT COUNT(*) FROM miniatures')->fetchOne();
        $totalModels = (int) ($conn->executeQuery('SELECT SUM(count) FROM miniatures')->fetchOne() ?? 0);
        $totalFolders = (int) $conn->executeQuery('SELECT COUNT(*) FROM folders')->fetchOne();
        $totalPictures = (int) $conn->executeQuery('SELECT COUNT(*) FROM pictures')->fetchOne();
        $totalProjects = (int) $conn->executeQuery('SELECT COUNT(*) FROM projects')->fetchOne();

        $statusRows = $conn->executeQuery(
            'SELECT status, SUM(count) as total FROM miniatures GROUP BY status'
        )->fetchAllAssociative();

        $statusBreakdown = [
            'Gray' => 0,
            'Built' => 0,
            'Painted' => 0,
        ];
        foreach ($statusRows as $row) {
            $statusBreakdown[$row['status']] = (int) $row['total'];
        }

        $recentlyPaintedRows = $conn->executeQuery(
            'SELECT m.name, m.painted_at, p.username, m.count
             FROM miniatures m
             INNER JOIN painter p ON m.painter_id = p.id
             WHERE m.painted_at IS NOT NULL
             ORDER BY m.painted_at DESC
             LIMIT 5'
        )->fetchAllAssociative();

        $recentlyPainted = [];
        foreach ($recentlyPaintedRows as $row) {
            $recentlyPainted[] = [
                'name' => $row['name'],
                'paintedAt' => $row['painted_at'],
                'username' => $row['username'],
                'count' => (int) $row['count'],
            ];
        }

        $topPaintersRows = $conn->executeQuery(
            "SELECT p.username, SUM(m.count) as painted_count
             FROM miniatures m
             INNER JOIN painter p ON m.painter_id = p.id
             WHERE m.status = 'Painted'
             GROUP BY m.painter_id
             ORDER BY painted_count DESC
             LIMIT 5"
        )->fetchAllAssociative();

        $topPainters = [];
        foreach ($topPaintersRows as $row) {
            $topPainters[] = [
                'username' => $row['username'],
                'paintedCount' => (int) $row['painted_count'],
            ];
        }

        $biggestShamesRows = $conn->executeQuery(
            "SELECT p.username, SUM(m.count) as unpainted_count
             FROM miniatures m
             INNER JOIN painter p ON m.painter_id = p.id
             WHERE m.status != 'Painted'
             GROUP BY m.painter_id
             ORDER BY unpainted_count DESC
             LIMIT 5"
        )->fetchAllAssociative();

        $biggestShames = [];
        foreach ($biggestShamesRows as $row) {
            $biggestShames[] = [
                'username' => $row['username'],
                'unpaintedCount' => (int) $row['unpainted_count'],
            ];
        }

        return new JsonResponse([
            'totalUsers' => $totalUsers,
            'totalMiniatures' => $totalMiniatures,
            'totalModels' => $totalModels,
            'totalFolders' => $totalFolders,
            'totalPictures' => $totalPictures,
            'totalProjects' => $totalProjects,
            'statusBreakdown' => $statusBreakdown,
            'recentlyPainted' => $recentlyPainted,
            'topPainters' => $topPainters,
            'biggestShames' => $biggestShames,
        ], Response::HTTP_OK);
    }
}
