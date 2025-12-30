import React, { useState, useRef } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const ContactForm: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isValidEmail = (email: string) => {
    // Basic email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Security: Input validation
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      // DEMO MODE: If credentials are missing, simulate a success for dev/demo purposes
      console.warn('EmailJS credentials are missing. Running in DEMO MODE (email will not actually send).');
      setStatus('submitting');
      setErrorMessage('');

      // Simulate network delay
      setTimeout(() => {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1500);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    if (form.current) {
      try {
        await emailjs.sendForm(
          SERVICE_ID,
          TEMPLATE_ID,
          form.current,
          PUBLIC_KEY
        );
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (error: any) {
        setStatus('error');
        console.error('EmailJS Error:', error);
        if (error.text) {
          setErrorMessage(error.text);
        } else {
          setErrorMessage('Oops! There was a problem submitting your form');
        }
      }
    }
  };

  if (status === 'success') {
    return (
      <div
        className="bg-slate-900/50 p-8 rounded-xl border border-green-500/30 flex flex-col items-center justify-center text-center animate-fade-in"
        role="status"
        aria-live="polite"
      >
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
          <CheckCircle size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Message Received</h3>
        <p className="text-slate-400 mb-6">Thanks for reaching out! I'll get back to you as soon as possible.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            maxLength={100}
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="subject" className="text-sm font-medium text-slate-300">Subject</label>
          <span
            className={`text-xs font-mono transition-colors ${
              formData.subject.length >= 200 ? 'text-red-500 font-bold' :
              formData.subject.length > 180 ? 'text-amber-500' :
              'text-slate-500'
            }`}
            aria-hidden="true"
          >
            {formData.subject.length}/200
          </span>
        </div>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          maxLength={200}
          value={formData.subject}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
          placeholder="Collaboration Inquiry"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
          <span
            className={`text-xs font-mono transition-colors ${
              formData.message.length >= 5000 ? 'text-red-500 font-bold' :
              formData.message.length > 4500 ? 'text-amber-500' :
              'text-slate-500'
            }`}
            aria-hidden="true"
          >
            {formData.message.length}/5000
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 resize-y"
          placeholder="How can we work together?"
        />
      </div>

      {status === 'error' && (
        <div
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full md:w-auto px-6 py-3 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
};
