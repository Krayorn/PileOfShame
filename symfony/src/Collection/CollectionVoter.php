<?php

namespace App\Collection;

use App\Collection\Folder\Folder;
use App\Collection\Miniature\Miniature;
use App\Collection\Miniature\Picture\Picture;
use App\Painter\Painter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CollectionVoter extends Voter
{
    private const EDIT = 'EDIT';
    private const DELETE = 'DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::EDIT, self::DELETE])) {
            return false;
        }

        return $subject instanceof Folder
            || $subject instanceof Miniature
            || $subject instanceof Picture;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof Painter) {
            return false;
        }

        if ($subject instanceof Folder) {
            return $subject->getPainter() === $user;
        }

        if ($subject instanceof Miniature) {
            return $subject->getPainter() === $user;
        }

        if ($subject instanceof Picture) {
            return $subject->getMiniature()->getPainter() === $user;
        }

        return false;
    }
}
