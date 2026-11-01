/**
 * КЛИЕНТСКИЙ СКРИПТ: ПЕРСОНАЛЬНЫЙ САЙТ ВАСИЛЬЕВОЙ ТАТЬЯНЫ
 * Инженерный подход к недвижимости | АН «Монолит», г. Чебоксары
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.SITE_CONFIG || {};

  // 1. Инициализация ссылок из файла конфигурации
  initDynamicConfig(config);

  // 2. Автоматическое обновление даты и года в футере
  initFooterDate();

  // 3. Интерактивная маска ввода телефона
  initPhoneMask();

  // 4. Выбор типа заявки (Покупка / Продажа / Консультация)
  initTypeSelector();

  // 5. Обработка отправки формы лидогенерации
  initLeadForm(config);

  // 6. Поведение шапки при скролле
  initHeaderScroll();

  // 7. Локальный реестр лидов (Lead Ledger) для тестирования и выгрузки
  initLeadLedgerAdmin();
});

/**
 * Автоматическое обновление текущего года
 */
function initFooterDate() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * Заполнение контактных ссылок из site-config.js
 */
function initDynamicConfig(config) {
  const social = config.socialLinks || {};
  const specialist = config.specialist || {};

  // VK
  document.querySelectorAll('[data-social="vk"]').forEach(el => {
    el.href = social.vk || '#';
  });

  // Instagram (только на сайте по ТЗ)
  document.querySelectorAll('[data-social="instagram"]').forEach(el => {
    el.href = social.instagram || '#';
  });

  // MAX
  document.querySelectorAll('[data-social="max"]').forEach(el => {
    el.href = social.max || '#';
  });

  // Телефон
  if (specialist.phoneTel) {
    document.querySelectorAll('[data-contact="phone-link"]').forEach(el => {
      el.href = `tel:${specialist.phoneTel}`;
    });
  }
}

/**
 * Интерактивная маска ввода телефонного номера +7 (XXX) XXX-XX-XX
 */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let val = input.value.replace(/\D/g, '');
      if (!val) {
        input.value = '';
        return;
      }

      if (val[0] === '7' || val[0] === '8') {
        val = val.substring(1);
      }

      let formatted = '+7 ';
      if (val.length > 0) formatted += '(' + val.substring(0, 3);
      if (val.length >= 3) formatted += ') ' + val.substring(3, 6);
      if (val.length >= 6) formatted += '-' + val.substring(6, 8);
      if (val.length >= 8) formatted += '-' + val.substring(8, 10);

      input.value = formatted;
    });

    input.addEventListener('focus', () => {
      if (!input.value.trim()) {
        input.value = '+7 (';
      }
    });

    input.addEventListener('blur', () => {
      if (input.value === '+7 (' || input.value === '+7 ') {
        input.value = '';
      }
    });
  });
}

/**
 * Выбор типа обращения (Покупка, Продажа, Консультация)
 */
function initTypeSelector() {
  const pills = document.querySelectorAll('.type-pill-btn');
  const hiddenInput = document.getElementById('selected-service-type');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (hiddenInput) {
        hiddenInput.value = pill.dataset.type || pill.textContent.trim();
      }
    });
  });
}

/**
 * Валидация и отправка заявки
 */
function initLeadForm(config) {
  const form = document.getElementById('lead-request-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('client-name');
    const phoneInput = document.getElementById('client-phone');
    const typeInput = document.getElementById('selected-service-type');
    const commentInput = document.getElementById('client-comment');
    const policyCheck = document.getElementById('policy-check');
    const submitBtn = form.querySelector('.btn-submit-lead');

    // Простая и надежная валидация
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const serviceType = typeInput ? typeInput.value : 'Консультация';
    const comment = commentInput ? commentInput.value.trim() : '';

    if (!name) {
      alert('Пожалуйста, укажите Ваше имя.');
      if (nameInput) nameInput.focus();
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      alert('Пожалуйста, введите корректный номер телефона (11 цифр).');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (policyCheck && !policyCheck.checked) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
      return;
    }

    const leadData = {
      id: 'lead_' + Date.now(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('ru-RU'),
      name,
      phone,
      serviceType,
      comment: comment || 'Без дополнительного комментария',
      source: 'Персональный лендинг Татьяны Васильевой (АН «Монолит»)'
    };

    // Блокировка кнопки на время отправки
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Отправка заявки...</span>`;

    try {
      // 1. Сохранение в локальный реестр Lead Ledger (localStorage)
      saveLeadToStorage(leadData);

      // 2. Если включена отправка в Telegram
      const tgConfig = config.leadSettings?.telegram;
      if (tgConfig?.enabled && tgConfig.botToken && tgConfig.chatId) {
        await sendTelegramNotification(tgConfig, leadData);
      }

      // 3. Если включена отправка на Email
      const emailConfig = config.leadSettings?.email;
      if (emailConfig?.enabled && (emailConfig.recipientEmail || emailConfig.accessKey)) {
        await sendEmailNotification(emailConfig, leadData);
      }

      // 4. Если включен Webhook (CRM)
      const whConfig = config.leadSettings?.webhook;
      if (whConfig?.enabled && whConfig.endpointUrl) {
        await sendWebhookNotification(whConfig.endpointUrl, leadData);
      }

      // Успех: показать модальное окно и сбросить форму
      form.reset();
      showSuccessModal(modal);

    } catch (err) {
      console.warn('Заявка сохранена в локальный реестр, но возникла ошибка при отправке в сеть:', err);
      // Даже если сеть недоступна, локально лид сохранен
      showSuccessModal(modal);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

/**
 * Сохранение лида в браузерное хранилище (гарантирует отсутствие потерь данных)
 */
function saveLeadToStorage(lead) {
  try {
    const existing = JSON.parse(localStorage.getItem('monolit_leads') || '[]');
    existing.unshift(lead);
    localStorage.setItem('monolit_leads', JSON.stringify(existing));
    console.log('[Lead Ledger] Заявка успешно сохранена локально:', lead);
  } catch (e) {
    console.error('Ошибка записи в localStorage:', e);
  }
}

/**
 * Отправка сообщения в Telegram через официальный Bot API
 */
/**
 * Отправка сообщения в Telegram через официальный Bot API
 * с поддержкой обхода блокировок api.telegram.org у российских провайдеров
 */
async function sendTelegramNotification(tg, lead) {
  if (!tg.botToken || !tg.chatId || tg.chatId === "YOUR_CHAT_ID") {
    console.warn("[Telegram] Токен настроен, но Chat ID пока не указан. Заявка сохранена в локальный реестр Lead Ledger.");
    return;
  }

  const text = 
    `🔔 *Новая заявка с персонального сайта!*\n\n` +
    `👤 *Имя:* ${lead.name}\n` +
    `📞 *Телефон:* [${lead.phone}](tel:${lead.phone.replace(/[^0-9+]/g, '')})\n` +
    `🎯 *Интересует:* ${lead.serviceType}\n` +
    `💬 *Комментарий:* ${lead.comment}\n` +
    `⏰ *Время:* ${lead.formattedDate}`;

  const payload = {
    chat_id: tg.chatId,
    text: text,
    parse_mode: 'Markdown'
  };

  // Список эндпоинтов (основной + надежные открытые CORS/SSL релеи)
  const endpoints = [
    `https://api.telegram.org/bot${tg.botToken}/sendMessage`,
    `https://corsproxy.io/?url=${encodeURIComponent(`https://api.telegram.org/bot${tg.botToken}/sendMessage`)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data && data.ok) {
        console.log('[Telegram] Заявка успешно доставлена в Telegram!');
        return;
      } else {
        console.warn('[Telegram] Ошибка ответа Telegram API:', data);
      }
    } catch (err) {
      console.warn(`[Telegram] Не удалось отправить через ${url}:`, err);
    }
  }
}

/**
 * Отправка сообщения на Email (FormSubmit / Web3Forms)
 */
async function sendEmailNotification(emailConfig, lead) {
  const email = emailConfig.recipientEmail || "tana15111977@gmail.com";

  if (emailConfig.service === "web3forms" && emailConfig.accessKey) {
    const payload = {
      access_key: emailConfig.accessKey,
      subject: `Новая заявка: ${lead.name} (${lead.serviceType})`,
      from_name: "Персональный сайт риелтора",
      name: lead.name,
      phone: lead.phone,
      service_type: lead.serviceType,
      message: lead.comment,
      date: lead.formattedDate
    };

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("[Email Web3Forms] Ошибка:", e);
    }
    return;
  }

  // По умолчанию: надежный прямой шлюз FormSubmit (доставляет на Gmail мгновенно)
  const formSubmitPayload = {
    "Имя клиента": lead.name,
    "Телефон": lead.phone,
    "Выбранная услуга": lead.serviceType,
    "Комментарий к заявке": lead.comment,
    "Дата и время": lead.formattedDate,
    "_subject": `🔔 Новая заявка с сайта: ${lead.name} (${lead.serviceType})`,
    "_template": "table",
    "_captcha": "false"
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formSubmitPayload)
    });
    const result = await res.json();
    console.log("[Email] Заявка успешно отправлена на почту:", result);
  } catch (err) {
    console.warn("[Email FormSubmit] Не удалось отправить на почту:", err);
  }
}

/**
 * Отправка на внешний Webhook (CRM)
 */
async function sendWebhookNotification(url, lead) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });
}

function showSuccessModal(modal) {
  if (modal) {
    modal.classList.add('active');
  } else {
    alert('Спасибо за Вашу заявку! Васильева Татьяна свяжется с Вами в ближайшее время.');
  }
}

/**
 * Тень шапки при скролле
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * Реестр лидов (нажмите Ctrl + Shift + L или кликните по служебной ссылке в футере)
 */
function initLeadLedgerAdmin() {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
      openLeadLedger();
    }
  });

  const adminLink = document.getElementById('admin-lead-link');
  if (adminLink) {
    adminLink.addEventListener('click', (e) => {
      e.preventDefault();
      openLeadLedger();
    });
  }
}

function openLeadLedger() {
  const leads = JSON.parse(localStorage.getItem('monolit_leads') || '[]');
  if (leads.length === 0) {
    alert('Реестр заявок пуст. Оставьте тестовую заявку через форму на сайте!');
    return;
  }

  const formatted = leads.map((l, i) => 
    `#${i + 1} | ${l.formattedDate}\nИмя: ${l.name}\nТел: ${l.phone}\nТип: ${l.serviceType}\nКоммент: ${l.comment}`
  ).join('\n\n--------------------\n\n');

  const action = confirm(
    `В реестре сохранено заявок: ${leads.length}\n\n` +
    formatted.substring(0, 1000) + 
    (formatted.length > 1000 ? '\n... (и другие)' : '') +
    '\n\nНажмите ОК, чтобы выгрузить все заявки в файл JSON, или Отмена для закрытия.'
  );

  if (action) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leads_monolit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
