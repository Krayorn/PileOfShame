import type { PictureWithMiniature } from '../types/miniature';
import { buildImageUrl } from '../lib/imageUtils';
import { collectionApi } from '../api';
import { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

interface AlbumProps {
    pictures: PictureWithMiniature[];
    title: string;
    onPictureDeleted?: (pictureId: string) => void;
}

export function Album({ pictures, title, onPictureDeleted }: AlbumProps) {
    const [deletingPictures, setDeletingPictures] = useState<Set<string>>(new Set());
    const [pictureToDelete, setPictureToDelete] = useState<string | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(-1);

    const handleDeletePicture = async (pictureId: string) => {
        setDeletingPictures(prev => new Set(prev).add(pictureId));
        
        try {
            await collectionApi.deletePicture(pictureId);
            onPictureDeleted?.(pictureId);
        } catch (error) {
            console.error('Failed to delete picture:', error);
            alert('Failed to delete image. Please try again.');
        } finally {
            setDeletingPictures(prev => {
                const newSet = new Set(prev);
                newSet.delete(pictureId);
                return newSet;
            });
        }
    };

    const openPhotoMode = (index: number = 0) => {
        setCurrentPhotoIndex(index);
    };

    const closePhotoMode = () => {
        setCurrentPhotoIndex(-1);
    };

    const goToPrevious = () => {
        setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : pictures.length - 1));
    };

    const goToNext = () => {
        setCurrentPhotoIndex((prev) => (prev < pictures.length - 1 ? prev + 1 : 0));
    };

    // Handle keyboard navigation
    useEffect(() => {
        if (currentPhotoIndex === -1) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCurrentPhotoIndex(-1);
            } else if (e.key === 'ArrowLeft') {
                setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : pictures.length - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentPhotoIndex((prev) => (prev < pictures.length - 1 ? prev + 1 : 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPhotoIndex, pictures.length]);
    if (pictures.length === 0) {
        return (
            <div className="mt-8">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-4 text-terminal-fg">
                    {title}
                </h3>
                <div className="text-center py-8 text-terminal-fgDim">
                    <svg className="w-12 h-12 mx-auto mb-4 text-terminal-fgDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="uppercase tracking-wider">No images uploaded yet</p>
                    <p className="text-sm uppercase tracking-wider">Upload images to your miniatures to see them here</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mt-8">
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-terminal-fg">
                    {title} ({pictures.length} {pictures.length === 1 ? 'image' : 'images'})
                </h3>
                    <button
                        onClick={() => openPhotoMode(0)}
                        className="px-3 py-1 border border-terminal-border bg-terminal-bg text-terminal-fg font-semibold uppercase tracking-wider text-xs hover:bg-terminal-bgLight transition-all"
                        title="Enter photo mode"
                    >
                        Photo Mode
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pictures.map((picture) => {
                    const imageUrl = buildImageUrl(picture.path);
                    const isDeleting = deletingPictures.has(picture.id);
                    
                    return (
                        <div 
                            key={picture.id} 
                            className="relative group border border-terminal-border rounded-sm overflow-hidden transition-all cursor-pointer hover:border-terminal-accent"
                            onClick={() => openPhotoMode(pictures.indexOf(picture))}
                        >
                            <img
                                src={imageUrl}
                                alt="Miniature"
                                className="w-full h-32 object-cover"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPictureToDelete(picture.id);
                                }}
                                disabled={isDeleting}
                                className="absolute top-2 right-2 bg-terminal-bg border border-terminal-destructive text-terminal-destructive rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 z-10"
                                title="Delete image"
                            >
                                {isDeleting ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {currentPhotoIndex !== -1 && pictures.length > 0 && (
            <div 
                className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-8"
                onClick={closePhotoMode}
            >
                <div className="relative flex items-center justify-center w-full max-w-5xl my-8">
                    {pictures.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute -left-10 top-1/2 -translate-y-1/2 h-32 w-10 border border-terminal-accent bg-terminal-accent text-terminal-bg hover:opacity-80 transition-all flex items-center justify-center z-20"
                            aria-label="Previous image"
                        >
                            <svg 
                                className="w-6 h-6" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    <div 
                        className="relative w-full flex flex-col items-center justify-center border-2 bg-terminal-bg p-8"
                        onClick={(e) => e.stopPropagation()}   
                    >
                        <div className="relative w-full flex items-center justify-center">
                            <img
                                src={buildImageUrl(pictures[currentPhotoIndex].path)}
                                alt={`${title} - Image ${currentPhotoIndex + 1}`}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                        
                        <div className="mt-4 w-full flex flex-col gap-2 px-2 text-sm uppercase tracking-wider">
                            <div className="flex items-center justify-between">
                                {pictures[currentPhotoIndex].miniatureName && (
                                    <div className="text-terminal-fgDim">
                                        SUBJECT NAME: <span className="text-terminal-fg">{pictures[currentPhotoIndex].miniatureName}</span>
                                    </div>
                                )}
                                
                                <div className="px-4 py-2 bg-terminal-bg border border-terminal-border text-terminal-fgDim uppercase tracking-wider">
                                    {currentPhotoIndex + 1} / {pictures.length}
                                </div>
                            </div>
                            
                            <div className="text-terminal-fgDim">
                                UPLOAD DATE: <span className="text-terminal-fg">
                                    {new Date(pictures[currentPhotoIndex].uploadedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    }).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={closePhotoMode}
                            className="absolute top-2 right-2 w-8 h-8 border border-terminal-border bg-terminal-bg text-terminal-fg hover:bg-terminal-bgLight hover:border-terminal-accent transition-all flex items-center justify-center z-10"
                            aria-label="Close photo mode"
                        >
                            <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                {pictures.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute -right-10 top-1/2 -translate-y-1/2 h-32 w-10 border border-terminal-accent bg-terminal-accent text-terminal-bg hover:opacity-80 transition-all flex items-center justify-center z-20"
                        aria-label="Next image"
                    >
                        <svg 
                            className="w-6 h-6" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
                </div>
            </div>
        )}

        <AlertDialog open={pictureToDelete !== null} onOpenChange={(open) => !open && setPictureToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Image</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this image? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            if (pictureToDelete) {
                                handleDeletePicture(pictureToDelete);
                                setPictureToDelete(null);
                            }
                        }}
                        className="border-terminal-destructive text-terminal-destructive hover:bg-terminal-bgLight"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
