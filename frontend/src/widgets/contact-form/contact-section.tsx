import { ContactForm } from './contact-form';

export function ContactSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            Свяжитесь с нами
          </h2>
          <p className="mt-3 text-center text-slate-500">
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
