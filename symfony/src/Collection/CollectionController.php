<?php

namespace App\Collection;

use App\Collection\Folder\Folder;
use App\Collection\Folder\FolderRepository;
use App\Collection\Miniature\Miniature;
use App\Collection\Miniature\MiniatureRepository;
use App\Collection\Miniature\Picture\Picture;
use App\Collection\Miniature\ProgressStatus;
use App\Painter\Painter;
use App\Service\S3UploadService;
use App\Service\ImageResizeService;
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

    #[Route('api/collections/folders/{folder}', methods: 'PATCH')]
    public function updateFolder(
        Folder $folder,
        Request $request,
        EntityManagerInterface $entityManager,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        
        // Ensure user can only update their own folders
        if ($folder->getPainter() !== $user) {
            return new JsonResponse(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }
        
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? null;

        $folder->update($name);

        $entityManager->flush();

        return new JsonResponse($folder->view(false), Response::HTTP_OK);
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
        // Handle regular JSON update
        $data = json_decode($request->getContent(), true);

        $status = ProgressStatus::tryFrom($data['status'] ?? '');
        $name = $data['name'] ?? null;
        $strCount = $data['count'] ?? null;
        $count = null;
        if ($strCount !== null) {
            $count = intval($strCount);
        }

        $miniature->update($name, $count, $status);

        $entityManager->flush();

        return new JsonResponse($miniature->view(), Response::HTTP_OK);
    }

    #[Route('api/collections/miniatures/{miniature}/pictures', methods: 'POST')]
    public function uploadPictures(
        Miniature $miniature,
        Request $request,
        EntityManagerInterface $entityManager,
        S3UploadService $s3UploadService,
        ImageResizeService $imageResizeService,
    ): Response
    {
        if ($request->files->count() === 0) {
            return new JsonResponse(['error' => 'No files uploaded'], Response::HTTP_BAD_REQUEST);
        }

        $uploadedFiles = $request->files->get('images');
        
        if (!$uploadedFiles) {
            return new JsonResponse(['error' => 'No images found in request'], Response::HTTP_BAD_REQUEST);
        }

        $uploadedPictures = [];
        $files = is_array($uploadedFiles) ? $uploadedFiles : [$uploadedFiles];

        foreach ($files as $file) {
            if ($file && $file->isValid()) {
                $resizedFile = $imageResizeService->resizeImage($file);
                
                $path = $s3UploadService->generatePath($miniature->getId()->toString(), $resizedFile->getClientOriginalName());
                
                $uploadedPath = $s3UploadService->uploadFile($resizedFile, $path);
                
                $picture = new Picture(
                    $miniature, 
                    $uploadedPath, 
                    $s3UploadService->getS3Endpoint(), 
                    $s3UploadService->getS3Bucket()
                );
                $entityManager->persist($picture);
                $miniature->addPicture($picture);
                
                $uploadedPictures[] = $picture->view();
            }
        }
        
        $entityManager->flush();
        
        return new JsonResponse($miniature->view(), Response::HTTP_CREATED);
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

    #[Route('api/collections/pictures/{picture}', methods: 'DELETE')]
    public function deletePicture(
        Picture $picture,
        EntityManagerInterface $entityManager,
        S3UploadService $s3UploadService,
    ): Response
    {
        /** @var $user Painter */
        $user = $this->getUser();
        
        if ($picture->getMiniature()->getPainter() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        
        $s3UploadService->deleteFile($picture->getPath());
        
        $entityManager->remove($picture);
        $entityManager->flush();
        
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
