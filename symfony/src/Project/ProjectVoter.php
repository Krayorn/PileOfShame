<?php

namespace App\Project;

use App\Painter\Painter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/** @extends Voter<string, Project> */
class ProjectVoter extends Voter
{
    private const VIEW = 'VIEW';

    private const EDIT = 'EDIT';

    private const DELETE = 'DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (! in_array($attribute, [self::VIEW, self::EDIT, self::DELETE], true)) {
            return false;
        }

        return $subject instanceof Project;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (! $user instanceof Painter) {
            return false;
        }

        return $subject->getPainter() === $user;
    }
}
