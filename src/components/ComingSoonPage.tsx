import React, { useState } from 'react';
import { Instagram } from 'lucide-react';
import { Toast } from './ui/toast';
import { supabase } from '../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });
  
  // Reset modal state when opening
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset all form states when modal opens
      setEmail('');
      setIsSubmitted(false);
      setSubmitStatus('idle');
    }
  };

  // Logo configuration
  const logoOpacity = 0.85;
  const backgroundVerticalPosition = 90; // 100% - 10% = 90%

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleWaitlistSignup();
  };

  const handleWaitlistSignup = async () => {
    if (!email) return;

    try {
      setIsSubmitted(true);
      setSubmitStatus('idle');
      
      // Call the edge function to handle waitlist signup and welcome email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setToast({
          isVisible: true,
          message: " You're on the List! We'll be in touch soon",
          type: 'success'
        });
        setEmail('');
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        if (response.status === 409) {
          setSubmitStatus('duplicate');
          setTimeout(() => {
            setIsOpen(false);
            setSubmitStatus('idle');
          }, 3000);
        } else {
          throw new Error(result.error || 'Failed to join waitlist');
        }
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      setToast({
        isVisible: true,
        message: 'Something went wrong. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://carlossawyerr-brand-website-assets.s3.us-east-2.amazonaws.com/facingright_cropped.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: `right ${backgroundVerticalPosition}%`,
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Logo Layer */}
      {/* Mobile Logo */}
      <div className="absolute inset-0 z-10 flex items-center justify-center md:hidden" style={{ paddingTop: '25vh' }}>
        <img 
          src="https://carlossawyerr-brand-website-assets.s3.us-east-2.amazonaws.com/CarlosSawyerr_white.svg"
          alt="Carlos Sawyerr"
          className="w-3/4 h-auto max-h-[60vh] object-contain"
          style={{ 
            opacity: logoOpacity,
          }}
        />
      </div>
      
      {/* Desktop Logo */}
      <div className="hidden md:flex absolute inset-0 z-10 items-center">
        <div className="w-[77%] max-w-none pl-4 sm:pl-6 md:pl-8 lg:pl-12 xl:pl-16">
          <img 
            src="https://carlossawyerr-brand-website-assets.s3.us-east-2.amazonaws.com/CarlosSawyerr_white.svg"
            alt="Carlos Sawyerr"
            className="w-full h-auto"
            style={{ 
              opacity: logoOpacity,
            }}
          />
        </div>
      </div>
      
      {/* Dark Overlay */}
      
      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header with Logo and Social Icons */}
        <header className="flex justify-end items-start p-4 sm:p-6 md:p-8 lg:p-12">
          
          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a 
              href="https://www.instagram.com/carlossawyerr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 text-center mt-8 sm:mt-12 md:mt-0" style={{ paddingTop: 'clamp(20px, 5vh, 50px)' }}>
          {/* Join Waitlist Dialog */}
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {/* Mobile Join Waitlist Button */}
            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2" style={{ top: '20%' }}>
              <DialogTrigger asChild>
                <button className="px-6 py-2 bg-transparent border-2 border-black text-black font-medium tracking-wide hover:bg-black hover:text-white transition-all duration-300 rounded-sm text-sm">
                 Get First Access
                </button>
              </DialogTrigger>
            </div>
            
            {/* Desktop Join Waitlist Button */}
            <div className="hidden md:block">
              <DialogTrigger asChild>
                <button className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-transparent border-2 border-white text-white font-medium tracking-wide hover:bg-white hover:text-black transition-all duration-300 rounded-sm text-base sm:text-lg md:mt-32 lg:mt-48">
                  Get First Access
                </button>
              </DialogTrigger>
            </div>
            
            <DialogContent className="sm:max-w-lg bg-white min-h-[280px] flex flex-col justify-between">
              {/* Logo - always visible */}
              <div className="flex justify-center mb-0 flex-shrink-0">
                <img 
                  src="https://carlossawyerr-brand-website-assets.s3.us-east-2.amazonaws.com/CarlosSawyerr_black.svg"
                  alt="Carlos Sawyerr"
                  className="h-12 w-auto"
                />
              </div>
              
              {/* Content area with consistent height */}
              <div className="flex-1 flex flex-col justify-center -mt-2">
                {/* Header content - only show before submission */}
                {submitStatus !== 'success' && submitStatus !== 'duplicate' && (
                  <DialogHeader className="text-center">
                    {/* Mobile Dialog Content */}
                    <div className="md:hidden">
                      <DialogTitle className="text-2xl sm:text-3xl font-serif text-black font-light tracking-wide">
                        
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-lg text-gray-700 font-light leading-relaxed mt-4 font-sans tracking-wide text-center">
                       <span className="italic">Get first access to Collection №1 </span>  <span className="not-italic">🎩</span>    <br/> 
             
                      </DialogDescription>
                    </div>
                    
                    {/* Desktop Dialog Content */}
                    <div className="hidden md:block">
                      <DialogTitle className="text-2xl sm:text-3xl font-serif text-black font-light tracking-wide">
                        
                      </DialogTitle>
                      <DialogDescription className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mt-1 font-sans tracking-wide text-center">
                       <span>Get first access to Collection №1   <br/> 
                       </span>
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                )}
                
                {/* Status Messages - appear in center when active */}
                {(submitStatus === 'success' || submitStatus === 'duplicate') && (
                  <div className="text-center py-4">
                    {submitStatus === 'success' && (
                      <p className="text-black font-light animate-fade-in-only text-lg sm:text-xl tracking-wide">
                       You're on the list. We'll be in touch soon!
                      </p>
                    )}
                    
                    {submitStatus === 'duplicate' && (
                      <p className="text-black font-light animate-fade-in-only text-lg sm:text-xl tracking-wide">
                        You're already on the list! 🎩
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
                {submitStatus !== 'success' && submitStatus !== 'duplicate' && (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black text-sm sm:text-base font-light tracking-wide placeholder:text-gray-400 placeholder:font-light"
                    required
                  />
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitted || submitStatus === 'success' || submitStatus === 'duplicate'}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-black text-white font-light tracking-widest uppercase hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 rounded-none text-xs sm:text-sm letter-spacing-wide"
                >
                  {(submitStatus === 'success' || submitStatus === 'duplicate') ? (
              <span className="flex items-center justify-center">
                <span className="animate-check mr-2">✓</span>
                You're In
              </span>
            ) : isSubmitted ? (
              '✓ You\'re In'
            ) : (
              <>
                <span className="md:hidden">Get First Access</span>
                <span className="hidden md:inline">Get First Access</span>
              </>
            )}
             </button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default ComingSoonPage;
