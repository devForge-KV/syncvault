import LegalPageLayout from '../../components/LegalPageLayout'

function RefundPolicy() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      summary="Straightforward subscription cancellation and refund terms for SyncVault agency plans."
    >
      <section className="legal-guarantee">
        <p className="legal-eyebrow">14-DAY MONEY-BACK GUARANTEE</p>
        <h2>Try SyncVault with confidence.</h2>
        <p>If your agency is not satisfied within 14 days of its first subscription charge, email us for a full refund. No questions asked.</p>
      </section>
      <section>
        <h2>How to request a refund</h2>
        <p>Email <a href="mailto:support@syncvault.com">support@syncvault.com</a> from your account email within 14 days of your first subscription charge. Include the agency name and the email associated with the subscription so we can locate the purchase.</p>
      </section>
      <section>
        <h2>Cancellation</h2>
        <p>You may cancel your subscription at any time from your dashboard settings. Cancellation takes effect at the end of the current billing cycle, and no future subscription charges will be made after that cycle ends.</p>
      </section>
      <section>
        <h2>Refund processing</h2>
        <p>Approved refunds are returned to the original payment method through Paddle, our Merchant of Record. Please allow 5–7 business days for the refund to appear, depending on your payment provider.</p>
      </section>
    </LegalPageLayout>
  )
}

export default RefundPolicy