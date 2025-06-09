"use client";

import Image from 'next/image';
import React from 'react';

export default function Product({
                                    imageUrl,
                                    name,
                                    rating,
                                    reviews,
                                    price,
                                }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Image */}
            <div className="relative w-full h-48">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="p-4">
                {/* Rating */}
                <div className="flex items-center text-gray-600 text-sm mb-2">
                    <span className="material-icons-outlined text-yellow-400 mr-1">star</span>
                    <span className="font-semibold">{rating}</span>
                    <span className="ml-1">({reviews})</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">{name}</h3>

                {/* Features */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-600 text-sm mb-4">
                    <div className="flex items-center">
                        <span className="material-icons-outlined mr-2">group</span>
                        <span>test</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between bg-[#eff6ff] py-1 px-3 rounded">
                    <span>Rent Now</span>
                    <span className="text-sm">${price}</span>
                </div>
            </div>
        </div>
    );
}
