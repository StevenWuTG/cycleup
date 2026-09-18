import { usePageTitle } from "../lib/usePageTitle";
import { Link } from "react-router-dom";
import { Callout, EmailLink, LegalPage, List, P, Section } from "../components/LegalPage";
import { SITE } from "../config/site";

// Keep this in step with what the app really does. If you add analytics, a new
// third-party service, payments, or change what is stored, update this page and
// bump SITE.legalUpdated.
export default function Privacy() {
  usePageTitle("Privacy Policy");
  return (
    <LegalPage title="Privacy Policy">
      <Callout title="The short version">
        <List>
          <li>We collect what you give us: your account details, the listings you post, your messages, and (optionally) your location.</li>
          <li>Listings and seller profiles are <strong>public</strong>. Messages are private between you and the other person.</li>
          <li>We don't sell your information, and we don't run ads or third-party analytics.</li>
          <li>You can ask us to delete your account and everything attached to it at any time.</li>
        </List>
      </Callout>

      <Section title="Who we are">
        <P>
          {SITE.name} is a marketplace where makers list upcycled goods and shoppers find them. It is run by {SITE.operator} ("we", "us").
          This policy explains what information {SITE.name} collects, how it's used, and the choices you have. Questions or requests: <EmailLink />.
        </P>
      </Section>

      <Section title="What we collect">
        <List>
          <li>
            <strong>Account details.</strong> Your email address, a password, and the username you choose. Your password is stored
            only in scrambled (hashed) form, so we can't read it.
          </li>
          <li>
            <strong>Your profile.</strong> Your username and the month you joined.
          </li>
          <li>
            <strong>Listings.</strong> The title, description, price, category, condition, origin story and photos you add, the city you
            choose for your location (its name and the approximate coordinates of the city's centre), your username, and when it was posted.
            We never ask for a street address.
          </li>
          <li>
            <strong>Messages.</strong> The text of messages you send through {SITE.name}, who sent them, when, and whether they've been read.
          </li>
          <li>
            <strong>Your location as a shopper.</strong> If you set a location so listings can be sorted by distance, it is saved
            only in your own browser. It is not sent to our servers. If you choose "Use my current location", your browser asks for
            your permission first, and we round the result to roughly a kilometre.
          </li>
          <li>
            <strong>Technical information.</strong> Like nearly every website, our providers automatically receive your IP address,
            browser type and the requests your browser makes. This is used to run and secure the service.
          </li>
        </List>
        <P>
          We don't collect payment details (there are no payments on {SITE.name}), government IDs, your contacts, or your precise
          location. Photos you upload are re-encoded in your browser first, which removes hidden information such as the GPS position
          many phone cameras embed in pictures.
        </P>
      </Section>

      <Section title="Who can see what">
        <List>
          <li><strong>Everyone, including people without an account:</strong> your username, the month you joined, and your listings (with photos, price, city and seller username).</li>
          <li><strong>Only you:</strong> your email address, your password, and the location you set as a shopper.</li>
          <li><strong>You and the other person:</strong> the messages in a conversation.</li>
          <li>
            <strong>Us:</strong> as the operator we can technically access what is stored in our database, including messages. We only
            look when we need to run or secure the service, look into a report of abuse, or comply with the law.
          </li>
        </List>
        <P>
          Listing photos are publicly reachable by anyone who has their web address, so don't upload pictures that show things you
          want to keep private (a house number, a car's licence plate, a person's face without their permission).
        </P>
      </Section>

      <Section title="How we use your information">
        <List>
          <li>To run the marketplace: show listings, let people message each other, and sort by distance.</li>
          <li>To let you sign in and to keep your account secure.</li>
          <li>To keep {SITE.name} safe: prevent spam and abuse, and look into reports.</li>
          <li>To send emails about your account that you need, such as confirming your address or resetting a password. We don't send marketing email.</li>
          <li>To meet legal obligations.</li>
        </List>
        <P>We do not sell or rent your personal information, and we don't use it for advertising.</P>
      </Section>

      <Section title="Services that handle your data">
        <P>To run {SITE.name} we rely on a few other companies. Each sees only what its job requires:</P>
        <List>
          <li>
            <strong>Supabase</strong> hosts our database, handles sign-in, and stores listing photos. Your account, listings, messages
            and photos are stored there.
          </li>
          <li>
            <strong>Our website host</strong> delivers the site to your browser and keeps standard server logs, which include IP addresses.
          </li>
          <li>
            <strong>Open-Meteo</strong> powers place search. When you type in a location box, what you type (for example "Denver") is
            sent from your browser to Open-Meteo, along with your IP address, so it can suggest matching places. We don't send your
            name, email or account details.
          </li>
          <li>
            <strong>Google Fonts</strong> supplies the site's typefaces, so your browser contacts Google when a page loads, which shares
            your IP address and browser details with Google.
          </li>
        </List>
        <P>
          We won't share your personal information with anyone else unless the law requires it, it's needed to protect someone's safety
          or our rights, you ask us to, or the service is transferred to a new owner (in which case we'd tell you).
        </P>
      </Section>

      <Section title="Cookies and browser storage">
        <P>
          We don't use advertising or tracking cookies. We use your browser's local storage for two things: keeping you signed in, and
          remembering the location you set as a shopper. Both are needed for those features to work. You can clear them any time by
          signing out, clearing your location, or clearing the site's data in your browser.
        </P>
      </Section>

      <Section title="How long we keep it">
        <List>
          <li>Your account, listings and photos stay until you delete them or ask us to delete your account.</li>
          <li>Deleting a listing removes it and its photos. Conversations about it are kept, so buyers and sellers don't lose their history.</li>
          <li>
            Our providers may keep backups and server logs for a limited time, so deleted information can linger briefly before it
            disappears for good.
          </li>
        </List>
      </Section>

      <Section title="Your choices and rights">
        <P>
          You can edit or delete your listings at any time from your <Link to="/profile" className="font-medium text-[#2d6a4f] underline underline-offset-2">profile</Link>,
          and you can clear your shopper location from the marketplace page.
        </P>
        <P>
          To see, correct or get a copy of your information, or to have your account deleted, email <EmailLink />. We'll usually
          respond within 30 days. Deleting your account removes your profile, your listings and photos, and every conversation you're
          part of. Because a conversation has two people in it, this also removes it for the other person.
        </P>
        <P>
          Depending on where you live, you may have further rights, such as the right to access, correct, delete or port your data, to
          object to how it's used, and to complain to your local data protection authority. We do not sell personal information, and we
          don't share it for targeted advertising.
        </P>
      </Section>

      <Section title="Security">
        <P>
          Traffic to {SITE.name} is encrypted, passwords are stored hashed, and access rules in our database limit who can read what
          (for example, only the two people in a conversation can read it). No system is perfectly secure, though, so please use a
          strong, unique password and tell us right away if you think your account has been misused.
        </P>
      </Section>

      <Section title="Children">
        <P>
          {SITE.name} is for people 18 and over. We don't knowingly collect information from anyone younger. If you think a child has
          given us information, email <EmailLink /> and we'll delete it.
        </P>
      </Section>

      <Section title="Where your data is processed">
        <P>
          Our providers may store and process information in the United States and other countries, which may have different data
          protection laws from where you live. By using {SITE.name} you understand your information may be transferred there.
        </P>
      </Section>

      <Section title="Changes to this policy">
        <P>
          If we change this policy we'll update the date at the top. For significant changes we'll also post a notice on the site.
          Using {SITE.name} after a change means you accept the updated policy. See also our <Link to="/terms" className="font-medium text-[#2d6a4f] underline underline-offset-2">Terms of Service</Link>.
        </P>
      </Section>

      <Section title="Contact us">
        <P>Questions, requests or concerns about privacy: <EmailLink />.</P>
      </Section>
    </LegalPage>
  );
}
