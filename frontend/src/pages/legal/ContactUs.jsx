import { useState } from "react";
import { FiClock, FiMail, FiSend, FiArrowRight } from "react-icons/fi";
import LegalPageLayout from "../../components/LegalPageLayout";

function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setResultMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setResultMessage("Web3Forms access key is missing.");
      setIsSuccess(false);
      setSubmitting(false);
      return;
    }

    formData.append("access_key", accessKey);
    formData.append("from_name", "SyncVault Support Portal");
    formData.append(
      "subject",
      `SyncVault Support: ${formData.get("name") || "New Inquiry"}`,
    );

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setResultMessage("Thank you! Your message has been sent successfully.");
        form.reset();
      } else {
        setIsSuccess(false);
        setResultMessage(
          data.message || "Failed to send message. Please try again.",
        );
      }
    } catch {
      setIsSuccess(false);
      setResultMessage("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalPageLayout
      eyebrow="WE'RE HERE TO HELP"
      title="Contact & Support"
      summary="Talk with the SyncVault team about your workspace, subscription, or a technical issue."
    >
      <div className="contact-layout">
        <aside className="contact-card">
          <span className="contact-card-icon">
            <FiMail />
          </span>
          <p className="legal-eyebrow">DIRECT SUPPORT</p>
          <a className="contact-email" href="mailto:support@syncvault.com">
            support@syncvault.com <FiArrowRight />
          </a>
          <div className="contact-response">
            <p>
              <FiClock /> <strong>Response within 24 hours</strong>
            </p>
            <span>
              We respond to all agency inquiries and technical support requests
              within 24 hours.
            </span>
          </div>
        </aside>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
          />

          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="How can we help?"
            rows="5"
            required
          />

          <button
            className="contact-submit"
            type="submit"
            disabled={submitting}
          >
            <FiSend />{" "}
            {submitting ? "Sending message..." : "Send support request"}
          </button>

          {resultMessage ? (
            <p
              className="contact-form-note"
              style={{ color: isSuccess ? "#10b981" : "#f87171" }}
            >
              {resultMessage}
            </p>
          ) : (
            <p className="contact-form-note">
              Your message will be sent directly to our support team.
            </p>
          )}
        </form>
      </div>
    </LegalPageLayout>
  );
}

export default ContactUs;
