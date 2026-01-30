import React from 'react';
import Link from 'next/link';

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
        <p className="text-md text-gray-400 mb-4">
          By accessing and using the RAID Arena platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">2. Use License</h2>
        <p className="text-md text-gray-400 mb-4">
          Permission is granted to temporarily download one copy of the materials (information or software) on RAID Arena's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc list-inside text-md text-gray-400 mb-4">
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>Attempt to decompile or reverse engineer any software contained on RAID Arena's website;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
        <p className="text-md text-gray-400 mb-4">
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by RAID Arena at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">3. No Gambling Policy</h2>
        <p className="text-md text-gray-400 mb-4">
          RAID Arena strictly prohibits any form of gambling, betting, or wagering on our platform. This includes, but is not limited to, placing bets on tournament outcomes, engaging in any form of real-money gaming, or using our platform to facilitate any illegal gambling activities. Users found to be in violation of this policy will have their accounts immediately terminated and may be reported to relevant authorities. Our platform is designed for skill-based gaming and entertainment only.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">4. Disclaimer</h2>
        <p className="text-md text-gray-400 mb-4">
          The materials on RAID Arena's website are provided on an 'as is' basis. RAID Arena makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p className="text-md text-gray-400 mb-4">
          Further, RAID Arena does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">5. Limitations</h2>
        <p className="text-md text-gray-400 mb-4">
          In no event shall RAID Arena or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RAID Arena's website, even if RAID Arena or a RAID Arena authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">6. Accuracy of Materials</h2>
        <p className="text-md text-gray-400 mb-4">
          The materials appearing on RAID Arena's website could include technical, typographical, or photographic errors. RAID Arena does not warrant that any of the materials on its website are accurate, complete or current. RAID Arena may make changes to the materials contained on its website at any time without notice. However RAID Arena does not make any commitment to update the materials.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">7. Links</h2>
        <p className="text-md text-gray-400 mb-4">
          RAID Arena has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by RAID Arena of the site. Use of any such linked website is at the user's own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">8. Modifications</h2>
        <p className="text-md text-gray-400 mb-4">
          RAID Arena may revise these Terms of Service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-3">9. Governing Law</h2>
        <p className="text-md text-gray-400 mb-4">
          These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </section>

      <div className="mt-8 text-center">
        <Link href="/" className="text-raid-orange hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TermsOfServicePage;