<?php

namespace App\Collection;

use App\Collection\Miniature\ProgressStatus;

class Statistics
{
    private array $folders;
    public function __construct(array $foldersIds, array $data)
    {
        foreach ($foldersIds as $folderId) {
            $this->folders[$folderId] = [];
            foreach (ProgressStatus::cases() as $status) {
                $this->folders[$folderId][$status->value] = 0;
            }
        }

        foreach ($data as $entry) {
            $folderId = $entry['folder_id'];
            $status = $entry['status'];
            $totalCount = $entry['total_count'];

            $this->folders[$folderId][$status] = $totalCount;
        }
    }

    public function view(): array
    {
        return $this->folders;
    }
}