import LegalPageLayout from '../../components/LegalPageLayout'

function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      summary="How SyncVault collects, uses, and protects information used to manage agency-client workspaces."
    >
      <section>
        <h2>Information we collect</h2>
        <p>We collect work email addresses and account details, agency workspace information, project briefs and milestones, deliverables, and communications shared through client workspaces.</p>
      </section>
      <section>
        <h2>How information is used</h2>
        <p>Information is used to authenticate accounts, operate agency and client portal access, coordinate projects and milestone approvals, provide customer support, and administer billing and related webhook processing.</p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>Payments are processed through Paddle, our Merchant of Record, subject to Paddle&apos;s terms and privacy notices. SyncVault uses MongoDB-hosted data services with encryption safeguards to store application data. Service providers process information only as needed to deliver their services.</p>
      </section>
      <section>
        <h2>Your privacy rights</h2>
        <p>You may request access to, correction of, or deletion of your personal information, subject to applicable legal requirements. We support GDPR data rights requests. To exercise a right or request account and data deletion, email <a href="mailto:support@syncvault.com">support@syncvault.com</a>.</p>
      </section>
      <section>
        <h2>Data retention and security</h2>
        <p>We retain information while an account is active and as needed to provide the service, meet legal obligations, resolve disputes, and enforce our agreements. We use appropriate technical and organizational safeguards, but no internet transmission or storage system can be guaranteed completely secure.</p>
      </section>
    </LegalPageLayout>
  )
}

export default PrivacyPolicy