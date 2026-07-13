import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="rounded-xl bg-white p-10 text-center shadow-xl">
        <h1 className="mb-4 text-5xl font-bold text-gray-800">
          Product Catalog
        </h1>

        <p className="mb-8 text-lg text-gray-600">
          Browse our collection of amazing products built with Next.js Dynamic
          Routes.
        </p>

        <Link
          href="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
        >
          View Products
        </Link>
      </div>
    </main>
  );
}
