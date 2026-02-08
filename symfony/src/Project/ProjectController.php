<?php

namespace App\Project;

use App\Collection\Miniature\Miniature;
use App\Collection\Miniature\MiniatureRepository;
use App\Painter\Painter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProjectController extends AbstractController
{
    #[Route('api/projects', methods: 'GET')]
    public function listProjects(
        ProjectRepository $projectRepository,
    ): Response {
        /** @var Painter $user */
        $user = $this->getUser();
        $projects = $projectRepository->findBy([
            'painter' => $user,
        ]);

        return new JsonResponse(array_map(fn (Project $project) => $project->view(), $projects), Response::HTTP_OK);
    }

    #[Route('api/projects', methods: 'POST')]
    public function createProject(
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response {
        /** @var Painter $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? '';
        $targetDate = isset($data['targetDate']) ? new \DateTimeImmutable($data['targetDate']) : null;

        $project = new Project($user, $name, $targetDate);

        $entityManager->persist($project);
        $entityManager->flush();

        return new JsonResponse($project->view(), Response::HTTP_CREATED);
    }

    #[Route('api/projects/{project}', methods: 'PATCH')]
    public function updateProject(
        Project $project,
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response {
        $this->denyAccessUnlessGranted('EDIT', $project);

        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? null;
        $targetDate = null;
        if (array_key_exists('targetDate', $data)) {
            $targetDate = $data['targetDate'] !== null ? new \DateTimeImmutable($data['targetDate']) : null;
        }

        $project->update($name, $targetDate);

        $entityManager->flush();

        return new JsonResponse($project->view(), Response::HTTP_OK);
    }

    #[Route('api/projects/{project}', methods: 'DELETE')]
    public function deleteProject(
        Project $project,
        EntityManagerInterface $entityManager,
    ): Response {
        $this->denyAccessUnlessGranted('DELETE', $project);

        $entityManager->remove($project);
        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('api/projects/{project}/miniatures', methods: 'POST')]
    public function addMiniature(
        Project $project,
        Request $request,
        EntityManagerInterface $entityManager,
        MiniatureRepository $miniatureRepository,
    ): Response {
        $this->denyAccessUnlessGranted('EDIT', $project);

        /** @var Painter $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $miniatureId = $data['miniatureId'] ?? null;
        $miniature = $miniatureRepository->findOneBy([
            'painter' => $user,
            'id' => $miniatureId,
        ]);

        if ($miniature === null) {
            return new JsonResponse([
                'error' => 'Miniature not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $project->addMiniature($miniature);
        $entityManager->flush();

        return new JsonResponse($project->view(), Response::HTTP_OK);
    }

    #[Route('api/projects/{project}/miniatures/{miniature}', methods: 'DELETE')]
    public function removeMiniature(
        Project $project,
        Miniature $miniature,
        EntityManagerInterface $entityManager,
    ): Response {
        $this->denyAccessUnlessGranted('EDIT', $project);

        $project->removeMiniature($miniature);
        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
