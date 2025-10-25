import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-white mb-6">Contact Us</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-raid-gold mb-3">Get in Touch</h2>
        <p className="text-md text-gray-400 mb-4">
          We'd love to hear from you! Whether you have questions, feedback, or need support,
          our team is here to help. Please use the contact methods below to reach out.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-raid-gold mb-3">Send Us a Message</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-md font-medium text-gray-400">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-raid-gold focus:border-raid-gold"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-md font-medium text-gray-400">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-raid-gold focus:border-raid-gold"
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-md font-medium text-gray-400">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-raid-gold focus:border-raid-gold"
              placeholder="Regarding a tournament issue"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-md font-medium text-gray-400">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-raid-gold focus:border-raid-gold"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-raid-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-raid-gold"
          >
            Send Message
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-raid-gold mb-3">Support</h2>
        <p className="text-md text-gray-400 mb-2">
          For technical support, account inquiries, or general questions, please email us at:
        </p>
        <p className="text-md font-medium text-raid-gold mb-4">
          <a href="mailto:support@raidarena.com" className="hover:underline">raid00arena@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-raid-gold mb-3">Business Inquiries</h2>
        <p className="text-md text-gray-400 mb-2">
          For partnerships, media inquiries, or other business-related matters, please contact:
        </p>
        <p className="text-md font-medium text-raid-gold mb-4">
          <a href="mailto:business@raidarena.com" className="hover:underline">raid00arena@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-raid-gold mb-3">Social Media</h2>
        <p className="text-md text-gray-400 mb-2">
          Follow us on our social media channels to stay updated with the latest news, tournaments, and community events:
        </p>
        <ul className="list-disc list-inside text-md text-gray-400 ml-4">
          <li className="mb-1"><a href="#" className="hover:underline">Twitter</a></li>
          <li className="mb-1"><a href="#" className="hover:underline">Facebook</a></li>
          <li className="mb-1"><a href="#" className="hover:underline">Instagram</a></li>
          <li><a href="#" className="hover:underline">Discord</a></li>
        </ul>
      </section>

    </div>
  );
};

export default ContactPage;