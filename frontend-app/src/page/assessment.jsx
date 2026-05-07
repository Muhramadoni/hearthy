export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-900">
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mb-8">
          <p className="text-sm font-semibold text-slate-600">
            Skrining kesehatan jantung
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Assessment</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Melakukan penilaian menyeluruh terhadap risiko kesehatan jantung Anda dengan
            mengisi formulir interaktif kami.
          </p>
        </section>

        {/* Assessment Form Content will go here */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/50">
          <p className="text-slate-600">Assessment form coming soon...</p>
        </div>
      </main>
    </div>
  );
}
