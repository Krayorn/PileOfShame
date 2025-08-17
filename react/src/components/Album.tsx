import type { Picture } from '../types/miniature';
import { buildImageUrl } from '../lib/imageUtils';
import { collectionApi } from '../api';
import { useState } from 'react';
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
    pictures: Picture[];
    title: string;
    onPictureDeleted?: (pictureId: string) => void;
}

export function Album({ pictures, title, onPictureDeleted }: AlbumProps) {
    const [deletingPictures, setDeletingPictures] = useState<Set<string>>(new Set());
    const [pictureToDelete, setPictureToDelete] = useState<string | null>(null);

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
    if (pictures.length === 0) {
        return (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {title}
                </h3>
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images to your miniatures to see them here</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {title} ({pictures.length} {pictures.length === 1 ? 'image' : 'images'})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pictures.map((picture) => {
                    const imageUrl = buildImageUrl(picture.path);
                    const isDeleting = deletingPictures.has(picture.id);
                    
                    return (
                        <div key={picture.id} className="relative group">
                            <img
                                src={imageUrl}
                                alt="Miniature"
                                className="w-full h-32 object-cover rounded-lg shadow-md"
                            />
                            <button
                                onClick={() => setPictureToDelete(picture.id)}
                                disabled={isDeleting}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
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
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
