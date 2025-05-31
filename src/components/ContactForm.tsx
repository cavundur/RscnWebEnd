'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      // Form verilerini doğrudan HTML form submit ile gönder
      // Bu yöntem CORS ve fetch sorunlarını bypass eder
      const form = e.currentTarget;
      form.action = "https://formsubmit.co/rscn.reference@gmail.com";
      form.method = "POST";
      form.submit();
      
      // Kullanıcıya geri bildirim ver
      setStatus('success');
      setMessage('Mesajınız gönderiliyor...');
      
      // Form gönderildikten sonra sayfayı yenilemeden önce kısa bir bekleme süresi
      setTimeout(() => {
        setMessage('Mesajınız başarıyla gönderildi!');
      }, 2000);
      
    } catch (err) {
      setStatus('error');
      setMessage('Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.');
      console.error('Form gönderme hatası:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <input name="name" placeholder="Adınız" required className="input" spellCheck={false} />
      <input name="email" type="email" placeholder="E-posta" required className="input" spellCheck={false} />
      <input name="_replyto" type="hidden" value="" /> {/* FormSubmit için ekstra alan */}
      <input name="subject" placeholder="Konu" required className="input" spellCheck={false} />
      <textarea name="message" placeholder="Mesajınız" required className="input" spellCheck={false} />
      
      {/* FormSubmit.co için gerekli alanlar */}
      <input type="hidden" name="_subject" value="RSCN Web Sitesi İletişim Formu" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value="https://cavundur.online/contact?success=true" />
      
      <button type="submit" className="btn">Gönder</button>
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
      {status === 'loading' && <p>Gönderiliyor...</p>}
    </form>
  );
} 