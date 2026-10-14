"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-4xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 text-neutral-600">Please try again. Your cart is kept.</p>
      <button
        onClick={reset}
        className="btn-signal mt-6 rounded-full px-6 py-3"
      >
        Try again
      </button>
    </div>
  );
}
