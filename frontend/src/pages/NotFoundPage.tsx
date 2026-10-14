import { Link } from 'react-router';

export default function NotFoundPage({
  title = 'Page not found',
}: {
  title?: string;
}) {
  return (
    <section className="py-12 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Link
        to="/models"
        className="mt-6 inline-block font-medium text-indigo-700 hover:underline"
      >
        Back to the models
      </Link>
    </section>
  );
}
