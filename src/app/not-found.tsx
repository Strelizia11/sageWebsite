import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="wrap section">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This page isn’t available.</h1>
      <p>It may have moved or is not yet published.</p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </main>
  );
}
