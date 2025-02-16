<?php

namespace App\Painter;

use App\Collection\Folder\Folder;
use App\Player\Invitation\Invitation;
use App\Player\Invitation\InvitationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class PainterController extends AbstractController
{
    #[Route('api/register', methods: 'POST')]
    public function register(
        Request $request,
        PainterRepository $painterRepository,
        UserPasswordHasherInterface  $passwordHasher,
        EntityManagerInterface $entityManager,
    ): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['username']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Invalid input.'], Response::HTTP_BAD_REQUEST);
        }

        $username = $data['username'];
        $plainPassword = $data['password'];

        $userExisting = $painterRepository->findOneBy(['username' => $username]);
        if ($userExisting !== null) {
            return new JsonResponse(['error' => 'Username taken.'], Response::HTTP_CONFLICT);
        }

        $painter = new Painter($username);

        $folder = new Folder($painter, null, $username);
        $entityManager->persist($folder);

        $hashedPassword = $passwordHasher->hashPassword($painter, $plainPassword);
        $painter->setPassword($hashedPassword);

        $entityManager->persist($painter);
        $entityManager->flush($painter);

        return new JsonResponse($painter->view(), Response::HTTP_CREATED);
    }

    #[Route('api/painters/{painter}', name: 'get_painter', methods: 'GET')]
    public function player(Painter $painter): Response
    {
        return new JsonResponse(
            $painter->view(),
            Response::HTTP_OK
        );
    }

}
