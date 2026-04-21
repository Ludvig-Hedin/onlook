# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with
`create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just
the scaffolding we set up for you, and add additional things later when they
become necessary.

If you are not familiar with the different technologies used in this project,
please refer to the respective docs. If you still are in the wind, please join
our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Auth Notes

- The development-only "Sign in as demo user" button uses the seeded Supabase demo account and then routes through `/auth/redirect` so the browser session is established before protected queries run.
- When pointing the app at a hosted Supabase project, you must set all of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DATABASE_URL`, then run the database schema and seed steps against that hosted database before the demo account can use the app end-to-end.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the
following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
  — Check out these awesome tutorials

You can check out the
[create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) —
your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for
[Vercel](https://create.t3.gg/en/deployment/vercel),
[Netlify](https://create.t3.gg/en/deployment/netlify) and
[Docker](https://create.t3.gg/en/deployment/docker) for more information.
