<?php

namespace App\Collection;

use App\Collection\Miniature\ProgressStatus;

class Statistics
{
    /**
     * @var array<string, array<string, int>>
     */
    private array $folders;

    /**
     * @param array<int, string> $foldersIds
     * @param array<int, array<string, mixed>> $data
     */
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

    /**
     * @return array<string, array<string, int>>
     */
    public function view(): array
    {
        return $this->folders;
    }
}
