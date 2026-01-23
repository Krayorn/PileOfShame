<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add sort_order column to folders table
 */
final class Version20260123220000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add sort_order column to folders table';
    }

    public function up(Schema $schema): void
    {
        // Add sort_order column as nullable initially
        $this->addSql('ALTER TABLE folders ADD COLUMN sort_order INTEGER DEFAULT NULL');
        
        // Assign sequential sort orders to existing folders grouped by parent folder and painter
        // This ensures siblings get sequential numbers starting from 0
        $this->addSql('
            UPDATE folders
            SET sort_order = (
                SELECT COUNT(*)
                FROM folders f2
                WHERE (f2.folder_id IS NULL AND folders.folder_id IS NULL OR f2.folder_id = folders.folder_id)
                  AND f2.painter_id = folders.painter_id
                  AND f2.rowid <= folders.rowid
            ) - 1
        ');
        
        // Set default 0 for any remaining NULL values
        $this->addSql('UPDATE folders SET sort_order = 0 WHERE sort_order IS NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE TEMPORARY TABLE __temp__folders AS SELECT id, painter_id, folder_id, name FROM folders');
        $this->addSql('DROP TABLE folders');
        $this->addSql('CREATE TABLE folders (id CHAR(36) NOT NULL --(DC2Type:uuid)
        , painter_id CHAR(36) NOT NULL --(DC2Type:uuid)
        , folder_id CHAR(36) DEFAULT NULL --(DC2Type:uuid)
        , name VARCHAR(255) NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_FOLDERS_PAINTER FOREIGN KEY (painter_id) REFERENCES painter (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_FOLDERS_PARENT FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO folders (id, painter_id, folder_id, name) SELECT id, painter_id, folder_id, name FROM __temp__folders');
        $this->addSql('DROP TABLE __temp__folders');
        $this->addSql('CREATE INDEX IDX_FOLDERS_PAINTER ON folders (painter_id)');
        $this->addSql('CREATE INDEX IDX_FOLDERS_PARENT ON folders (folder_id)');
    }
}
