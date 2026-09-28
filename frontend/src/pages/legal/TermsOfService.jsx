import LegalPageLayout from '../../components/LegalPageLayout'

function TermsOfService() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      summary="The terms that apply when agencies and clients use SyncVault to organize collaborative project work."
    >
      <section>
        <h2>Acceptance of these terms</h2>
        <p>By creating an account or using SyncVault, agencies and their clients agree to these Terms of Service. If you use SyncVault on behalf of an organization, you confirm that you are authorized to accept these terms for it.</p>
      </section>
      <section>
        <h2>Permitted use</h2>
        <p>SyncVault may be used to manage client deliverables, project briefs, shared resources, feedback, and milestone approvals. You may not use the service for unlawful, malicious, abusive, or fraudulent activity, to distribute spam, or to interfere with the service or other users.</p>
      </section>
      <section>
        <h2>Subscriptions and cancellation</h2>
        <p>Paid subscriptions are billed on a recurring monthly or annual basis according to the plan selected at checkout. Users may cancel at any time through their dashboard settings. Cancellation takes effect according to the billing terms presented at purchase; access may continue through the paid billing period.</p>
      </section>
      <section>
        <h2>Account and workspace content</h2>
        <p>You are responsible for your account credentials, the content you submit, and ensuring you have the rights needed to share workspace information with collaborators. Keep your account details accurate and notify us if you believe your account has been accessed without authorization.</p>
      </section>
      <section>
        <h2>Availability and limitation of liability</h2>
        <p>SyncVault is provided “as is” and “as available.” We work toward high availability but do not guarantee uninterrupted or error-free service. To the extent permitted by law, SyncVault is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms may be sent to <a href="mailto:support@syncvault.com">support@syncvault.com</a>.</p>
      </section>
    </LegalPageLayout>
  )
}

export default TermsOfService