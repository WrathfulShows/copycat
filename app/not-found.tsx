import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-4xl font-extrabold">Nothing here</h1>
      <p className="mt-2 text-neutral-600">That page does not exist. The shop does.</p>
      <Link href="/" className="btn-signal mt-6 inline-block rounded-full px-6 py-3">
        Back to shop
      </Link>
    </div>
  );
}
