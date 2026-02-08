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

    /**
     * @var list<string>
     */
    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $email = null;

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
            'isAdmin' => in_array('ROLE_ADMIN', $this->roles, true),
            'email' => $this->email,
        ];
    }

    /**
     * @return list<string>
     */
    public function getRoles(): array
    {
        return $this->roles;
    }

    /**
     * @return non-empty-string
     */
    public function getUserIdentifier(): string
    {
        if ($this->username === '') {
            throw new \InvalidArgumentException('Username cannot be empty');
        }
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }
}
