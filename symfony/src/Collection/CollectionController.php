<?php

namespace App\Collection;

use App\Collection\Folder\Folder;
use App\Collection\Folder\FolderRepository;
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
        FolderRepository $folderRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? '';
        $count = intval($data['count'] ?? 1);

        $status = ProgressStatus::tryFrom($data['status']);
        $folderId = $data['folderId'] ?? null;
        if ($folderId === null) {
            return new JsonResponse(['error' => 'Folder ID is required.'], Response::HTTP_BAD_REQUEST);
        }
        $folder = $folderRepository->find($folderId);

        if ($status === null) {
            $status = ProgressStatus::Gray;
        }

        $miniature = new Miniature($user, $name, $status, $count, $folder);

        $entityManager->persist($miniature);
        $entityManager->flush();

        return new JsonResponse($miniature->view(), Response::HTTP_CREATED);
    }

    #[Route('api/collections/folders', methods: 'POST')]
    public function addFolder(
        Request $request,
        EntityManagerInterface $entityManager,
        FolderRepository $folderRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? '';
        $folderId = $data['folderId'] ?? null;
        if ($folderId === null) {
            return new JsonResponse(['error' => 'Parent folder ID is required.'], Response::HTTP_BAD_REQUEST);
        }
        $folder = $folderRepository->find($folderId);

        $folder = new Folder($user, $folder, $name);
        $entityManager->persist($folder);
        $entityManager->flush();

        return new JsonResponse($folder->view(), Response::HTTP_CREATED);
    }

    #[Route('api/collections/folders/{folder}', methods: 'DELETE')]
    public function deleteFolder(
        Folder $folder,
        EntityManagerInterface $entityManager,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        $entityManager->remove($folder);
        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('api/collections/folders', methods: 'GET')]
    public function getAllFolders(
        FolderRepository $folderRepository,
    ): Response
    {   
        /** @var $user Painter */
        $user = $this->getUser();
        $folders = $folderRepository->findBy(['painter' => $user]);
        return new JsonResponse(array_map(function (Folder $folder) {
            return $folder->view(false);
        }, $folders), Response::HTTP_OK);
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

    #[Route('api/collections/miniatures/{miniature}', methods: 'PATCH')]
    public function updateMini(
        Miniature $miniature,
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response
    {
        $data = json_decode($request->getContent(), true);

        $status = ProgressStatus::tryFrom($data['status'] ?? '');
        $name = $data['name'] ?? null;
        $strCount = $data['count'] ?? null;
        $count = null;
        if ($strCount !== null) {
            $count = intval($strCount);
        }

        $miniature->update($name, $count,$status);

        $entityManager->flush();

        return new JsonResponse($miniature->view(), Response::HTTP_OK);
    }

    #[Route('api/collections/miniatures', methods: 'PATCH')]
    public function moveMiniatures(
        Request $request,
        EntityManagerInterface $entityManager,
        FolderRepository $folderRepository,
        MiniatureRepository $miniatureRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $miniatureIds = $data['miniatureIds'] ?? [];
        $folderIds = $data['folderIds'] ?? [];
        $targetFolderId = $data['targetFolderId'] ?? null;

        if ($targetFolderId === null) {
            return new JsonResponse(['error' => 'Target folder ID is required.'], Response::HTTP_BAD_REQUEST);
        }   

        $targetFolder = $folderRepository->findOneBy(['painter' => $user, 'id' => $targetFolderId]);
    
        $miniatures = $miniatureRepository->findBy(['painter' => $user, 'id' => $miniatureIds]);
        foreach ($miniatures as $miniature) {
            $miniature->setFolder($targetFolder);
        }

        $folders = $folderRepository->findBy(['painter' => $user, 'id' => $folderIds]);
        foreach ($folders as $folder) {
            $folder->setParentFolder($targetFolder);
        }

        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('api/collections', methods: 'GET')]
    public function getCollection(
        Request $request,
        FolderRepository $folderRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();

        $folderId = $request->query->get('folderId');
        if ($folderId !== null) {
            $folder = $folderRepository->findOneBy(['painter' => $user, 'id' => $folderId]);
        } else {
            $folder = $folderRepository->findOneBy(['painter' => $user, 'parentFolder' => null]);
        }

        return new JsonResponse($folder->view(), Response::HTTP_OK);
    }

    #[Route('api/collections/stats', methods: 'GET')]
    public function getCollectionStats(
        Request $request,
        FolderRepository $folderRepository,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();

        $folderId = $request->query->get('folderId');
        if ($folderId !== null) {
            $folder = $folderRepository->findOneBy(['painter' => $user, 'id' => $folderId]);
        } else {
            $folder = $folderRepository->findOneBy(['painter' => $user, 'parentFolder' => null]);
        }

        $stats = $folderRepository->getStats($folder);

        return new JsonResponse($stats->view(), Response::HTTP_OK);
    }
}
