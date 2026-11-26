export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <p>AI Models Comparator is an ESILV student project.</p>

      <h2 className="text-lg font-semibold">Personal data</h2>
      <p>
        We collect your email address and username to create and identify your
        account.
      </p>

      <h2 className="text-lg font-semibold">Security</h2>
      <p>
        Passwords are stored as bcrypt hashes. A session cookie is used to keep
        you signed in.
      </p>

      <h2 className="text-lg font-semibold">Purpose</h2>
      <p>
        Your account allows you to use community features such as voting and
        commenting on AI models.
      </p>
    </section>
  );
}
