import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center max-w-md p-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          JC Soluções
        </h1>
        <p className="text-gray-600 mb-8">
          Sistema de Gestão de Dívidas
        </p>
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Área Administrativa
          </Link>
        </div>
      </div>
    </main>
  );
}