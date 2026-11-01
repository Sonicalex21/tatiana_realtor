/**
 * ФАЙЛ КОНФИГУРАЦИИ ПЕРСОНАЛЬНОГО САЙТА РИЕЛТОРА
 * Васильева Татьяна — Эксперт по недвижимости АН «Монолит», г. Чебоксары
 * 
 * Все контактные данные, социальные сети и способы получения заявок
 * централизованно настраиваются в этом файле.
 */

window.SITE_CONFIG = {
  // Информация о специалисте
  specialist: {
    fullName: "Васильева Татьяна",
    title: "Эксперт по недвижимости",
    agency: "АН «Монолит»",
    city: "г. Чебоксары",
    positioning: "Риелтор с инженерным подходом",
    phoneDisplay: "8 965 680 98 98",
    phoneTel: "+79656809898",
    workRegion: "Чебоксары, Новочебоксарск и Чувашская Республика"
  },

  // Социальные сети и мессенджеры (Telegram НЕ используется по ТЗ)
  socialLinks: {
    // Ссылка на профиль ВКонтакте
    vk: "https://vk.com/tatiana_vas_realtor_monolit",
    
    // Ссылка на профиль Instagram (присутствует на сайте по ТЗ)
    instagram: "https://www.instagram.com/tatiana_vas_realtor/",
    
    // Ссылка на профиль или чат в мессенджере MAX
    max: "https://max.ru/89656809898"
  },

  // Настройки получения заявок с сайта
  leadSettings: {
    // 1. Всегда включено: надежное локальное сохранение всех заявок (Lead Ledger)
    saveToLocalStorage: true,

    // 2. Оповещения в Telegram (заявка моментально падает Татьяне в Telegram)
    telegram: {
      enabled: true, // Активировано!
      botUsername: "@LeadsFromTatiana_Bot",
      botToken: "9052645040:AAH50D1kti3jFsInRkaQSChoXJsgLvmiPYQ", // Токен вашего бота
      chatId: "YOUR_CHAT_ID" // Сюда вставим цифровой Chat ID получателя
    },

    // 3. Отправка на Email (мгновенные заявки прямо на почту Татьяны)
    email: {
      enabled: true, // Включено!
      service: "formsubmit",
      recipientEmail: "tana15111977@gmail.com" // Почта Татьяны для приема заявок
    },

    // 4. Webhook (для интеграции с CRM агентства «Монолит»: Битрикс24 или AmoCRM)
    webhook: {
      enabled: false, // Установите true для активации
      endpointUrl: "https://your-crm-webhook-url.com"
    }
  },

  // Постоянный канонический адрес страницы риелтора
  canonicalUrl: "https://sonicalex21.github.io/tatiana_realtor/"
};
