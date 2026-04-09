import Navbar from '../components/Navbar';
import '../styles/styles.css';
import '../styles/ResourcesPage.css';

const resourceGroups = [
  {
    title: 'Immediate Safety',
    items: [
      'If you are in immediate danger, call your local emergency number right away.',
      'Go to the nearest safe place, public area, hospital, shelter, or police station if you can do so safely.',
      'If possible, contact a trusted friend, family member, advocate, or counselor and tell them you need help.',
    ],
  },
  {
    title: 'After an Assault',
    items: [
      'If you choose to seek medical care, ask for a sexual assault examination and follow-up support.',
      'Try to preserve evidence if you may want to report later, but do not delay safety or medical care to do so.',
      'You are not required to report right away in every situation. Get support first if that is safer for you.',
    ],
  },
  {
    title: 'Support and Recovery',
    items: [
      'Counselors, trauma therapists, crisis centers, and survivor advocates can help you make a plan.',
      'Support groups can help you feel less alone and can make the next step feel manageable.',
      'If you want help finding local resources, email info@RiverOfLife.com and we will respond as soon as we can.',
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="resources-page-shell">
      <Navbar />
      <main className="resources-page-main">
        <section className="resources-hero">
          <p className="resources-kicker">Public Resources</p>
          <h1>Get Help</h1>
          <p>
            Support, next steps, and contact information for people who have been sexually assaulted or need help with related trauma.
          </p>
        </section>

        <div className="resources-layout">
          <div className="resources-content">
            {resourceGroups.map((group) => (
              <article key={group.title} className="resources-card">
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className="resources-sidebar">
            <article className="resources-sidebar-card">
              <h2>Helpful Reminders</h2>
              <p>
                You deserve support, you are not alone, and what happened to you is not your fault.
              </p>
            </article>
            <article className="resources-sidebar-card">
              <h2>Contact Us</h2>
              <p>
                Email <a href="mailto:info@RiverOfLife.com">info@RiverOfLife.com</a> if you need help finding resources, want to ask a question, or need a safe place to start.
              </p>
            </article>
          </aside>
        </div>
      </main>
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}