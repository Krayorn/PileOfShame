export type FolderStatistics = {
    Built: number;
    Gray: number;
    Painted: number;
};

export type CollectionStatistics = {
    [folderId: string]: FolderStatistics;
}; 