import type { Metadata } from 'next';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
};

export default function PrivacyPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Политика конфиденциальности
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              Настоящая Политика конфиденциальности определяет порядок обработки
              и защиты персональных данных пользователей сайта компании
              LumenBridge Finance Ltd (далее — «Компания») в соответствии с
              применимым европейским законодательством, включая GDPR, а также
              иными нормативными актами.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              1. Контролёр персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Контролёром персональных данных является компания LumenBridge
              Finance Ltd, осуществляющая деятельность в соответствии с
              применимым европейским законодательством.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              2. Персональные данные, которые мы обрабатываем
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Компания может обрабатывать следующие категории персональных
              данных:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>имя и фамилия;</li>
              <li>дата рождения;</li>
              <li>номер телефона;</li>
              <li>адрес электронной почты;</li>
              <li>номер удостоверения личности (ID);</li>
              <li>адрес проживания;</li>
              <li>информация о занятости и доходе (при необходимости);</li>
              <li>данные о компании (для бизнес-клиентов);</li>
              <li>
                иная информация, предоставленная пользователем добровольно при
                подаче заявки или через формы на сайте.
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Компания не обрабатывает специальные категории персональных данных
              (чувствительные данные), за исключением случаев, прямо
              предусмотренных законодательством.
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Предоставление персональных данных является добровольным, однако
              без их предоставления обработка заявки или оказание услуг может
              быть невозможна.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              3. Цели обработки персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Персональные данные обрабатываются в следующих целях:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>обработка заявок на получение займа;</li>
              <li>оценка кредитоспособности клиента;</li>
              <li>заключение и исполнение договоров;</li>
              <li>коммуникация с пользователями;</li>
              <li>выполнение требований законодательства;</li>
              <li>предотвращение мошенничества и обеспечение безопасности.</li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              4. Правовые основания обработки
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Обработка персональных данных осуществляется на основании:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>согласия субъекта персональных данных;</li>
              <li>
                необходимости исполнения договора или принятия мер до его
                заключения;
              </li>
              <li>выполнения юридических обязательств Компании;</li>
              <li>
                законных интересов Компании, включая предотвращение
                мошенничества и управление рисками.
              </li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              5. Срок хранения персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Персональные данные хранятся не дольше, чем это необходимо для
              достижения целей обработки, либо в сроки, установленные применимым
              европейским законодательством.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              6. Передача персональных данных третьим лицам
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Компания может передавать персональные данные:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                сервисам, участвующим в проверке заявок и оценке
                кредитоспособности;
              </li>
              <li>
                поставщикам технических услуг (хостинг, обработка данных,
                коммуникационные сервисы);
              </li>
              <li>
                государственным органам — в случаях, предусмотренных
                законодательством.
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Передача осуществляется с соблюдением требований законодательства
              о защите персональных данных.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              7. Права субъектов персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Пользователь имеет право:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>на доступ к своим персональным данным;</li>
              <li>на исправление неточных данных;</li>
              <li>на удаление данных (в случаях, предусмотренных законом);</li>
              <li>на ограничение обработки;</li>
              <li>на отзыв согласия;</li>
              <li>
                на подачу жалобы в уполномоченный орган по защите данных в
                применимой юрисдикции.
              </li>
            </ul>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              8. Меры по защите персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Компания применяет организационные и технические меры для защиты
              персональных данных от несанкционированного доступа, утраты,
              изменения или распространения.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              9. Контакты по вопросам персональных данных
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              По вопросам, связанным с обработкой персональных данных,
              пользователь может связаться с Компанией по контактным данным,
              указанным на сайте.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
