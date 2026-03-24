import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <Card className="text-center space-y-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-800">Email</h3>
            <p className="text-gray-600">contact@learnenglish.com</p>
            <a href="mailto:contact@learnenglish.com" className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
              Send Email →
            </a>
          </Card>

          <Card className="text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800">Phone</h3>
            <p className="text-gray-600">+91 9876 543210</p>
            <a href="tel:+919876543210" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              Call Now →
            </a>
          </Card>

          <Card className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Location</h3>
            <p className="text-gray-600">Tamil Nadu, India</p>
            <a href="#" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              View Map →
            </a>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>

          {submitted ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-semibold">✓ Thank you for your message!</p>
              <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-base"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-base"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="input-base resize-none"
                  placeholder="Your message..."
                ></textarea>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Quick Answers</h2>
          <div className="space-y-4">
            {[
              {
                q: "What's your response time?",
                a: "We typically respond to inquiries within 24 hours."
              },
              {
                q: "Do you offer support for schools?",
                a: "Yes! We provide dedicated support for schools and educational institutions."
              },
              {
                q: "Can I request custom features?",
                a: "Absolutely! Email us with your requirements and we'll discuss possibilities."
              },
              {
                q: "Is there a refund policy?",
                a: "Yes, 30-day money-back guarantee if you're not satisfied."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="space-y-2">
                <h4 className="font-bold text-gray-800">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
