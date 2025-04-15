import React from "react";

interface TermsProps {
  onClose: () => void; // Callback function to close the modal
}

export default function Terms({ onClose }: TermsProps) {
  return (
    <div className="bg-white rounded-lg p-6 w-full md:w-full lg:w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Data Privacy</h3>
        <p className="text-sm text-gray-600">
          Protecting your privacy is paramount to us. We rigorously adhere to
          safeguarding your personal information, ensuring its confidentiality,
          and strictly limiting its usage to the purposes explicitly stated
          herein. Your data is neither employed for training machine learning
          models nor diverted to any unrelated activities.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Data Security</h3>
        <p className="text-sm text-gray-600">
          We employ various security protocols to shield your data from any
          unauthorized access, tampering, disclosure, or destruction. While we
          exercise maximum diligence to ensure data security, it is imperative
          to acknowledge that no electronic storage mechanism is infallible.
          Absolute security cannot be unconditionally guaranteed.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">No Third-Party Access</h3>
        <p className="text-sm text-gray-600">
          Under no circumstances do we disclose your personal information to
          third-party entities, except as mandated by legal obligations or when
          essential for the seamless delivery of our services.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Data Collection and Usage
        </h3>
        <p className="text-sm text-gray-600">
          We securely store your data and communications using encryption to
          ensure the uninterrupted and smooth operation of our services. This
          approach enables us to deliver a seamless and tailored user experience
          that aligns with your needs. All stored information is protected by
          stringent security protocols and encryption to prevent unauthorized
          access and ensure its integrity. We are committed to using your data
          solely for the purpose of maintaining and improving the essential
          functionalities of our services, without compromising your privacy or
          confidentiality.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Changes to This Policy</h3>
        <p className="text-sm text-gray-600">
          We retain the right to amend these Terms and Conditions at our
          discretion. We strongly advise regular reviews of this document to
          remain informed of any updates. Continued usage of our services
          post-modification constitutes acceptance of the revised terms.
        </p>
      </section>

      <div className="flex justify-end mt-6">
        <button type="button"
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          onClick={onClose} // Use the callback to close the modal
        >
          Close
        </button>
      </div>
    </div>
  );
}
