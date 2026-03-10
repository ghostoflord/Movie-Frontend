// components/modal/movie_detail_modal.tsx
'use client';

import { Movie } from '@/types/auth';

import PencilIcon from '@/components/icons/PencilIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import XMarkIcon from '../icons/XMarkIcon';

interface MovieDetailModalProps {
    movie: Movie | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function MovieDetailModal({ movie, isOpen, onClose, onEdit, onDelete }: MovieDetailModalProps) {
    if (!isOpen || !movie) return null;

    return (
        <>
            {/* Overlay - phủ toàn màn hình */}
            <div
                className="fixed inset-0 bg-black bg-opacity-75 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal container - căn giữa màn hình */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {/* Modal content */}
                    <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 transform transition-all">

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {/* Content - giữ nguyên phần còn lại */}
                        <div className="max-h-[90vh] overflow-y-auto">
                            {/* Header với poster và thông tin cơ bản */}
                            <div className="relative h-64 bg-gradient-to-r from-red-600 to-red-800 rounded-t-xl overflow-hidden">
                                {/* Background poster blur */}
                                {movie.poster_url && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110"
                                        style={{ backgroundImage: `url(${movie.poster_url})` }}
                                    />
                                )}

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                                {/* Content */}
                                <div className="relative h-full flex items-end p-6">
                                    <div className="flex items-end space-x-6">
                                        {/* Poster */}
                                        {movie.poster_url && (
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.name}
                                                className="w-32 h-48 object-cover rounded-lg shadow-2xl border-2 border-white"
                                            />
                                        )}

                                        {/* Basic info */}
                                        <div className="flex-1 pb-2">
                                            <h2 className="text-3xl font-bold text-white">{movie.name}</h2>
                                            <p className="text-xl text-gray-300 mt-1">{movie.origin_name}</p>

                                            <div className="flex items-center space-x-3 mt-3">
                                                <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                                                    {movie.status}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700">
                                                    {movie.quality}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700">
                                                    {movie.year}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body - Chi tiết phim */}
                            <div className="p-6 space-y-6">
                                {/* Action buttons */}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={onEdit}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Xóa
                                    </button>
                                </div>

                                {/* Movie details grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Thông tin cơ bản</h3>
                                        <dl className="space-y-3">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">ID:</dt>
                                                <dd className="text-white font-mono">{movie.id}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Slug:</dt>
                                                <dd className="text-white">{movie.slug}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Ngôn ngữ:</dt>
                                                <dd className="text-white">{movie.language || 'Chưa cập nhật'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Tập hiện tại:</dt>
                                                <dd className="text-white">{movie.episode_current}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Tổng số tập:</dt>
                                                <dd className="text-white">{movie.episode_total}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Thông tin bổ sung</h3>
                                        <dl className="space-y-3">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Ngày tạo:</dt>
                                                <dd className="text-white">
                                                    {new Date(movie.created_at).toLocaleDateString('vi-VN')}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Cập nhật:</dt>
                                                <dd className="text-white">
                                                    {new Date(movie.updated_at).toLocaleDateString('vi-VN')}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Mô tả</h3>
                                    <div
                                        className="text-gray-300 bg-gray-800 p-4 rounded-lg border border-gray-700"
                                        dangerouslySetInnerHTML={{ __html: movie.description }}
                                    />
                                </div>

                                {/* Episodes */}
                                {movie.episodes && movie.episodes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Danh sách tập</h3>
                                        <div className="grid grid-cols-6 gap-2">
                                            {movie.episodes.map((ep) => (
                                                <div
                                                    key={ep.id}
                                                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 text-center hover:bg-gray-700 cursor-pointer transition-colors"
                                                    title={ep.embed_url ? 'Có video' : 'Chưa có video'}
                                                >
                                                    <span className="text-sm">Tập {ep.episode_number}</span>
                                                    {ep.embed_url && (
                                                        <span className="ml-1 text-green-500">●</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comments (nếu có) */}
                                {movie.comments && movie.comments.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Bình luận</h3>
                                        <div className="space-y-3">
                                            {movie.comments.map((comment: any) => (
                                                <div key={comment.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                    <p className="text-white text-sm">{comment.content}</p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}