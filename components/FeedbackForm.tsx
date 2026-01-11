import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackFormProps {
  essayTitle: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ essayTitle }) => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    setErrorMessage('');

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          message: message,
          from_email: email || 'anonymous@user.com',
          essay_title: essayTitle,
          source: 'Charlie Feng Portfolio - Feedback Form'
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setMessage('');
      setEmail('');
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setStatus('error');
      setErrorMessage('Failed to send feedback. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-3">
          <CheckCircle className="text-green-400 w-12 h-12" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Thank you for your thoughts!</h3>
        <p className="text-slate-400">Your feedback has been captured and sent to Charlie.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300 hover:underline"
        >
          Send another thought
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 md:p-8 my-12">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Leave a thought</h3>
        <p className="text-slate-400 text-sm">
          Did this essay spark an idea? Share your feedback or questions directly with me.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback-message" className="sr-only">Your message</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your perspective..."
            required
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="feedback-email" className="sr-only">Email (optional)</label>
            <input
              type="email"
              id="feedback-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email (optional)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending' || !message.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-lg transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none min-w-[140px]"
          >
            {status === 'sending' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
};
