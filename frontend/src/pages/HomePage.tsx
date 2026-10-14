import { Link } from 'react-router';
import { APP_NAME } from '../app-name';

export default function HomePage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {APP_NAME}
      </h1>
      <Link
        to="/models"
        className="mt-8 inline-block rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
      >
        Browse models
      </Link>
    </section>
  );
}
