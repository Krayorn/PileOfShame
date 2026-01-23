<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260123211833 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE painter ADD COLUMN email VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE TEMPORARY TABLE __temp__pictures AS SELECT id, miniature_id, path, s3_endpoint, s3_bucket, uploaded_at, rotation FROM pictures');
        $this->addSql('DROP TABLE pictures');
        $this->addSql('CREATE TABLE pictures (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , miniature_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , path VARCHAR(255) NOT NULL, s3_endpoint VARCHAR(255) NOT NULL, s3_bucket VARCHAR(255) NOT NULL, uploaded_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , rotation INTEGER NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_8F7C2FC0903C60DB FOREIGN KEY (miniature_id) REFERENCES miniatures (id) ON UPDATE NO ACTION ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO pictures (id, miniature_id, path, s3_endpoint, s3_bucket, uploaded_at, rotation) SELECT id, miniature_id, path, s3_endpoint, s3_bucket, uploaded_at, rotation FROM __temp__pictures');
        $this->addSql('DROP TABLE __temp__pictures');
        $this->addSql('CREATE INDEX IDX_8F7C2FC0903C60DB ON pictures (miniature_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__painter AS SELECT id, password, is_admin, username FROM painter');
        $this->addSql('DROP TABLE painter');
        $this->addSql('CREATE TABLE painter (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , password VARCHAR(255) NOT NULL, is_admin BOOLEAN DEFAULT 0 NOT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO painter (id, password, is_admin, username) SELECT id, password, is_admin, username FROM __temp__painter');
        $this->addSql('DROP TABLE __temp__painter');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_80E09D8F85E0677 ON painter (username)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__pictures AS SELECT id, miniature_id, uploaded_at, rotation, path, s3_endpoint, s3_bucket FROM pictures');
        $this->addSql('DROP TABLE pictures');
        $this->addSql('CREATE TABLE pictures (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , miniature_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , uploaded_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , rotation INTEGER DEFAULT 0 NOT NULL, path VARCHAR(255) NOT NULL, s3_endpoint VARCHAR(255) NOT NULL, s3_bucket VARCHAR(255) NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_8F7C2FC0903C60DB FOREIGN KEY (miniature_id) REFERENCES miniatures (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO pictures (id, miniature_id, uploaded_at, rotation, path, s3_endpoint, s3_bucket) SELECT id, miniature_id, uploaded_at, rotation, path, s3_endpoint, s3_bucket FROM __temp__pictures');
        $this->addSql('DROP TABLE __temp__pictures');
        $this->addSql('CREATE INDEX IDX_8F7C2FC0903C60DB ON pictures (miniature_id)');
    }
}
