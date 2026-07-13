"use client";

export default function SearchBar({ searchTerm, setSearchTerm }) {
    return (
        <div className="mb-8">
            <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}