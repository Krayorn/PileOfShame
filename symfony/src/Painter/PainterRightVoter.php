<?php

namespace App\Painter;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class PainterRightVoter implements VoterInterface
{
    public function vote(TokenInterface $token, $subject, array $attributes): int
    {
        $user = $token->getUser();

        if (! $user instanceof Painter) {
            return self::ACCESS_DENIED;
        }

        if (! $subject instanceof Painter) {
            return self::ACCESS_ABSTAIN;
        }

        if ($subject->getId() === $user->getId()) {
            return self::ACCESS_GRANTED;
        }

        return self::ACCESS_DENIED;
    }
}
