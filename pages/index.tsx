import Head from 'next/head';
import UploadImage from '../components/UploadImage';

export default function Home() {
  return (
    <>
      <Head>
        <title>Traductor Clínico</title>
      </Head>
      <main className="min-h-screen bg-gray-100 py-10">
        <h1 className="text-3xl text-center font-bold mb-6 text-blue-600">
          Traductor de Análisis Clínicos
        </h1>
        <UploadImage />
      </main>
    </>
  );
}
