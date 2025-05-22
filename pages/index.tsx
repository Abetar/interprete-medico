import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Traductor Clínico</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-white text-black">
        <h1 className="text-4xl font-bold text-blue-600">
          Hola mundo desde TailwindCSS 🚀
        </h1>
      </main>
    </>
  );
}
