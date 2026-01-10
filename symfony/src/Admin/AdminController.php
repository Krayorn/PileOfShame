<?php

namespace App\Admin;

use App\Painter\PainterRepository;
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

        $users = $painterRepository->findAll();
        $usersData = [];

        foreach ($users as $painter) {
            $usersData[] = $painterRepository->getUserStatistics($painter);
        }

        return new JsonResponse($usersData, Response::HTTP_OK);
    }
}
