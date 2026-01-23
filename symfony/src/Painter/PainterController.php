<?php

namespace App\Painter;

use App\Collection\Folder\Folder;
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

    #[Route('api/painters/me', methods: 'PATCH')]
    public function updateMe(
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response
    {
        /** @var Painter $user */
        $user = $this->getUser();
        
        if ($user === null) {
            return new JsonResponse(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if ($email !== null && $email !== '') {
            // Basic email validation
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return new JsonResponse(['error' => 'Invalid email format.'], Response::HTTP_BAD_REQUEST);
            }
            $user->setEmail($email);
        } else {
            $user->setEmail(null);
        }

        $entityManager->flush();

        return new JsonResponse($user->view(), Response::HTTP_OK);
    }

}
