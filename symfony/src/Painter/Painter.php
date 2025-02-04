<?php

namespace App\Painter;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Table(name: 'painter')]
#[ORM\Entity()]
class Painter implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;

    #[ORM\Column(type: 'string')]
    private string $password;

    public function __construct(
        #[ORM\Column(type: 'string', unique: true)]
        private readonly string $username,
    ) {
        $this->id = Uuid::uuid4();
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    /**
     * @return array<string, mixed>
     */
    public function view(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
        ];
    }

    public function getRoles(): array
    {
        return [];
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    public function eraseCredentials(): void
    {
        // $this->password = null; never called ?
    }

    public function setPassword(string $hashedPassword): void
    {
        $this->password = $hashedPassword;
    }
}
