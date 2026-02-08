<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260208011758 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE projects (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , painter_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , created_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , name VARCHAR(255) NOT NULL, target_date DATETIME DEFAULT NULL --(DC2Type:datetime_immutable)
        , PRIMARY KEY(id), CONSTRAINT FK_5C93B3A4D3A137FE FOREIGN KEY (painter_id) REFERENCES painter (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_5C93B3A4D3A137FE ON projects (painter_id)');
        $this->addSql('CREATE TABLE project_miniatures (project_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , miniature_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , PRIMARY KEY(project_id, miniature_id), CONSTRAINT FK_E152D9C0166D1F9C FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_E152D9C0903C60DB FOREIGN KEY (miniature_id) REFERENCES miniatures (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_E152D9C0166D1F9C ON project_miniatures (project_id)');
        $this->addSql('CREATE INDEX IDX_E152D9C0903C60DB ON project_miniatures (miniature_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__painter AS SELECT id, password, username, email FROM painter');
        $this->addSql('DROP TABLE painter');
        $this->addSql('CREATE TABLE painter (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , password VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, email VARCHAR(255) DEFAULT NULL, roles CLOB NOT NULL --(DC2Type:json)
        , PRIMARY KEY(id))');
        $this->addSql('INSERT INTO painter (id, password, username, email, roles) SELECT id, password, username, email, CASE WHEN username = \'krayorn\' THEN \'["ROLE_ADMIN"]\' ELSE \'[]\' END FROM __temp__painter');
        $this->addSql('DROP TABLE __temp__painter');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_80E09D8F85E0677 ON painter (username)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE projects');
        $this->addSql('DROP TABLE project_miniatures');
        $this->addSql('CREATE TEMPORARY TABLE __temp__painter AS SELECT id, password, roles, email, username FROM painter');
        $this->addSql('DROP TABLE painter');
        $this->addSql('CREATE TABLE painter (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , password VARCHAR(255) NOT NULL, roles CLOB NOT NULL --(DC2Type:json)
        , email VARCHAR(255) DEFAULT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO painter (id, password, roles, email, username) SELECT id, password, roles, email, username FROM __temp__painter');
        $this->addSql('DROP TABLE __temp__painter');
    }
}
