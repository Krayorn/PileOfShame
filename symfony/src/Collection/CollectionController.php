<?php

namespace App\Collection;

use App\Collection\Miniature\Miniature;
use App\Collection\Miniature\MiniatureRepository;
use App\Collection\Miniature\ProgressStatus;
use App\Painter\Painter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CollectionController extends AbstractController
{
    #[Route('api/collections/miniatures', methods: 'POST')]
    public function addMiniature(
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? '';
        $count = intval($data['count'] ?? 1);
        $status = ProgressStatus::tryFrom($data['status']) ?? ProgressStatus::Gray;


        $miniature = new Miniature($user, $name, $status, $count);

        $entityManager->persist($miniature);
        $entityManager->flush();

        return new JsonResponse($miniature->view(), Response::HTTP_CREATED);
    }

    #[Route('api/collections/miniatures/{miniature}', methods: 'DELETE')]
    public function deleteMini(
        Miniature $miniature,
        EntityManagerInterface $entityManager,
    ): Response
    {
        $entityManager->remove($miniature);
        $entityManager->flush();
        
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('api/collections', methods: 'GET')]
    public function getCollection(
        Request $request,
        MiniatureRepository $miniatureRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();

        $miniatures = $miniatureRepository->findBy(['painter' => $user]);

        return new JsonResponse(array_map(fn($mini) => $mini->view(), $miniatures), Response::HTTP_OK);
    }
}