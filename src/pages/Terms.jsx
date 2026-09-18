import { usePageTitle } from "../lib/usePageTitle";
import { Link } from "react-router-dom";
import { Callout, EmailLink, LegalPage, List, P, Section } from "../components/LegalPage";
import { SITE } from "../config/site";

// Keep this in step with what the app really does (there are no payments, for
// example). If that changes, update this page and bump SITE.legalUpdated.
export default function Terms() {
  usePageTitle("Terms of Service");
  return (
    <LegalPage title="Terms of Service">
      <Callout title="The short version">
        <List>
          <li>{SITE.name} is a place for makers and shoppers to find each other. <strong>We aren't part of any sale</strong>: we don't handle payments, shipping or disputes.</li>
          <li>Post honestly, be respectful, and don't list anything illegal or unsafe.</li>
          <li>You own what you post, and you let us show it on {SITE.name}.</li>
          <li>We can remove content or accounts that break these rules.</li>
        </List>
      </Callout>

      <Section title="1. Agreeing to these terms">
        <P>
          By creating an account or using {SITE.name} you agree to these Terms and to our{" "}
          <Link to="/privacy" className="font-medium text-[#2d6a4f] underline underline-offset-2">Privacy Policy</Link>.
          If you don't agree, please don't use {SITE.name}. The service is run by {SITE.operator} ("we", "us").
        </P>
      </Section>

      <Section title="2. What CycleUp is, and isn't">
        <P>
          {SITE.name} lets makers list upcycled and repurposed items and lets shoppers browse them and message the seller.
          We are only a venue. We don't buy, sell, hold, inspect, ship or guarantee any item, we don't verify who anyone is, and we
          don't process payments. Any purchase is an agreement directly between the buyer and the seller, and we are not a party to it.
        </P>
      </Section>

      <Section title="3. Your account">
        <List>
          <li>You must be at least 18 years old.</li>
          <li>Give accurate information and keep your password secret. You're responsible for everything done through your account.</li>
          <li>One person, one account. Don't impersonate anyone or choose a username that is misleading or offensive.</li>
          <li>Tell us at <EmailLink /> if you think someone else has used your account.</li>
        </List>
      </Section>

      <Section title="4. Your listings and content">
        <List>
          <li>You are responsible for what you post: listings, photos, descriptions, origin stories and messages ("your content").</li>
          <li>Only post items you have the right to sell, and describe them honestly, including their condition, materials and where they came from.</li>
          <li>List things that fit {SITE.name}: upcycled, repurposed or handmade items made from reclaimed materials.</li>
          <li>Only upload photos and text you own or have permission to use.</li>
          <li>
            If you list a vehicle or vehicle part, a device, or a tool, you're responsible for having the legal right to sell it (for a
            vehicle, that includes a clear title), for describing its condition and history honestly, and for meeting any safety, registration
            or tax rules that apply. Wipe personal data from any device before you sell it.
          </li>
        </List>
        <P>
          You keep ownership of your content. By posting it you give us a free, worldwide, non-exclusive licence to host, store, copy,
          display and distribute it on and in connection with {SITE.name} (including showing your listings to the public) for as long as
          it remains on the service. This licence ends when you delete the content, apart from short-lived backups.
        </P>
      </Section>

      <Section title="5. What you can't do">
        <List>
          <li>List illegal, stolen or counterfeit goods, or items that infringe someone else's rights.</li>
          <li>List weapons, ammunition, explosives, drugs, or hazardous items. Be especially careful with anything for children, such as cots, toys or car seats, which must meet safety rules that upcycled items often can't.</li>
          <li>Post adult content, or anything hateful, threatening, harassing or defamatory.</li>
          <li>Mislead, defraud or spam other people, or post other people's private information.</li>
          <li>Scrape or copy the site with automated tools, or try to get around its security, access other people's data, or disrupt the service.</li>
          <li>Use {SITE.name} to break the law.</li>
        </List>
      </Section>

      <Section title="6. Buying and selling: your responsibility">
        <P>
          Because we aren't part of any sale, you deal with the other person at your own risk. Sellers must describe items accurately, keep
          the deals they agree to, and follow the laws that apply to them (product safety, licensing, taxes). Buyers should read listings
          carefully, ask questions, and inspect an item before paying.
        </P>
        <P>A few sensible precautions:</P>
        <List>
          <li>Meet in a public place, ideally with someone else, and inspect the item before you pay.</li>
          <li>Be wary of anyone who overpays, rushes you, asks for gift cards, or wants to move the conversation elsewhere.</li>
          <li>Use a payment method you can trace, and never send money for something you haven't seen if you can avoid it.</li>
        </List>
        <P>We can't resolve disputes between users, arrange refunds, or be responsible for what happens in a transaction.</P>
      </Section>

      <Section title="7. Messages">
        <P>
          Messages are private between the two people in a conversation. Don't use them to harass anyone or to send spam. As our
          Privacy Policy explains, we may look at messages if someone reports a problem, if we need to keep the service safe, or if the law
          requires it.
        </P>
      </Section>

      <Section title="8. Removing content and closing accounts">
        <P>
          We may, but aren't required to, review content, and we may remove any listing or message, or suspend or close any account, at
          our discretion, for example if these Terms are broken or if something looks unsafe. To report a problem, use the Report button on a listing, a seller's page or a conversation, or email <EmailLink />.
        </P>
      </Section>

      <Section title="9. Our property">
        <P>
          The {SITE.name} name, logo, design and software belong to us, and you may not copy them except as the law allows. If you send
          us feedback or suggestions, we may use them freely without owing you anything.
        </P>
        <P>
          If you believe something on {SITE.name} infringes your copyright, email <EmailLink /> with a description of your work, where
          the material appears, and your contact details, and we'll review it and may remove it.
        </P>
      </Section>

      <Section title="10. Other companies' services">
        <P>
          {SITE.name} relies on services from other companies, and may link to other websites. We don't control them and aren't responsible
          for their content or practices.
        </P>
      </Section>

      <Section title="11. No warranties">
        <P>
          {SITE.name} is provided "as is" and "as available", without promises of any kind. We don't guarantee that it will always be
          available or error-free, or that listings are accurate, safe, legal or of any particular quality, or that other users are who they
          say they are or will behave well.
        </P>
      </Section>

      <Section title="12. Limits on our liability">
        <P>
          To the fullest extent the law allows, we aren't liable for indirect, incidental, special, consequential or punitive damages, or for
          lost profits, data or goodwill, and we aren't liable for anything another user does or for any transaction between users. If we are
          found liable to you for any reason, our total liability is limited to US$100. Some places don't allow these limits, so they apply
          only as far as the law permits, and nothing in these Terms limits any rights you have under mandatory consumer law where you live.
        </P>
      </Section>

      <Section title="13. If a claim arises from your actions">
        <P>
          You agree to cover the reasonable costs of any claim brought against us because of your content, your dealings with other users,
          or your breach of these Terms.
        </P>
      </Section>

      <Section title="14. Changes to the service and these terms">
        <P>
          {SITE.name} is a small, evolving service. We may change, pause or end it, and we may update these Terms. When we do, we'll change the date
          at the top, and for significant changes we'll post a notice on the site. Using {SITE.name} after a change means you accept the new Terms.
        </P>
      </Section>

      <Section title="15. Ending your use">
        <P>
          You can stop using {SITE.name} whenever you like and ask us to delete your account at <EmailLink />. We may suspend or end your
          access as described above. Sections that by their nature should continue, such as those on liability, indemnity and governing law,
          survive.
        </P>
      </Section>

      <Section title="16. Governing law">
        <P>
          These Terms are governed by the laws of {SITE.governingLaw}, without regard to its conflict-of-laws rules. Before starting any
          formal proceeding, please contact us at <EmailLink /> so we can try to sort it out informally. Any dispute we can't resolve that way
          will be brought in the state or federal courts located in Nevada, and you agree to their jurisdiction.
        </P>
      </Section>

      <Section title="17. The small print">
        <P>
          These Terms and the Privacy Policy are the whole agreement between you and us about {SITE.name}. If any part is found unenforceable,
          the rest still applies. If we don't enforce a part right away, that doesn't mean we've given it up. You may not transfer your
          account or these Terms to anyone else.
        </P>
      </Section>

      <Section title="Contact us">
        <P>Questions about these Terms: <EmailLink />.</P>
      </Section>
    </LegalPage>
  );
}
