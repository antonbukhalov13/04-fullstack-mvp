import { ContactForm } from './contact-form';

export function ContactSection() {
  return (
    <section id="contact" className="bg-slate-900 py-24 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Свяжитесь с нами
          </h2>
          <p className="mt-3 text-center text-slate-400">
            Если у вас есть вопросы или вам нужна помощь — наша команда готова
            помочь.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
