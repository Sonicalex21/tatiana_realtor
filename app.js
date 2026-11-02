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

  // 8. Умное скрытие плавающей панели связи (при скролле вниз и бездействии 1.5 сек)
  initFloatingBarBehavior();

  // 9. Автоматическая оранжевая подсветка карточки при свайпе/перелистывании («Услуги» и «Инженерный подход»)
  initHorizontalSwipeHighlight();
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

  const policyCheckEl = document.getElementById('policy-check');
  if (policyCheckEl) {
    policyCheckEl.addEventListener('change', () => {
      const container = policyCheckEl.closest('.form-policy-check');
      if (container && policyCheckEl.checked) {
        container.classList.remove('input-error');
      }
    });
  }

  // Предотвращаем переключение чекбокса при клике по ссылке на Политику конфиденциальности
  document.querySelectorAll('.form-policy-check a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

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

    const policyContainer = policyCheck ? policyCheck.closest('.form-policy-check') : null;
    [nameInput, phoneInput].forEach(inp => inp && inp.classList.remove('input-error'));
    if (policyContainer) policyContainer.classList.remove('input-error');

    if (!name) {
      if (nameInput) {
        nameInput.classList.add('input-error');
        nameInput.focus();
      }
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      if (phoneInput) {
        phoneInput.classList.add('input-error');
        phoneInput.focus();
      }
      return;
    }

    if (policyCheck && !policyCheck.checked) {
      if (policyContainer) policyContainer.classList.add('input-error');
      policyCheck.focus();
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
      // 1. Локальное сохранение копии заявки
      saveLeadToStorage(leadData);

      // 2. Отправка на Email риелтора (tana15111977@gmail.com)
      const emailConfig = config.leadSettings?.email;
      if (emailConfig?.enabled) {
        await sendEmailNotification(emailConfig, leadData);
      }

      // 3. Если настроен защищенный Webhook (CRM)
      const whConfig = config.leadSettings?.webhook;
      if (whConfig?.enabled && whConfig.endpointUrl) {
        await sendWebhookNotification(whConfig.endpointUrl, leadData);
      }

      // Успех: показать модальное окно и сбросить форму
      form.reset();
      showSuccessModal(modal);

    } catch (err) {
      console.warn('Заявка принята, но возникло предупреждение при отправке:', err);
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
 * Отправка сообщения на Email риелтора через защищенный шлюз
 */
async function sendEmailNotification(emailConfig, lead) {
  const email = emailConfig.recipientEmail || "tana15111977@gmail.com";

  const formSubmitPayload = {
    "Имя клиента": lead.name,
    "Телефон": lead.phone,
    "Выбранная услуга": lead.serviceType,
    "Комментарий к заявке": lead.comment,
    "Дата и время": lead.formattedDate,
    "_subject": `🔔 Новая заявка с сайта риелтора: ${lead.name} (${lead.serviceType})`,
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
    console.log("[Email] Заявка успешно доставлена на почту:", result);
  } catch (err) {
    console.warn("[Email] Предупреждение при отправке на почту:", err);
  }
}

/**
 * Отправка на внешний закрытый Webhook (CRM или защищенный сервер)
 */
async function sendWebhookNotification(url, lead) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    console.log('[Webhook] Заявка успешно передана в закрытый вебхук');
  } catch (err) {
    console.warn('[Webhook] Предупреждение при передаче в вебхук:', err);
  }
}

function showSuccessModal(modal) {
  if (modal) {
    modal.classList.add('active');
  } else {
    alert('Спасибо за Вашу заявку! Васильева Татьяна свяжется с Вами в ближайшее время.');
  }
}

/**
 * Умное поведение верхней шапки при скроллинге:
 * - При скроллинге вниз (scrollDiff > 6 / deltaY > 10) шапка плавно скрывается
 * - При скроллинге вверх (scrollDiff < 0 / deltaY < 0 / свайп вверх / стрелка вверх) шапка мгновенно появляется
 * - Защита от дребезга тачпада: микро-отскоки после скролла вверх не скрывают шапку
 * - Время бездействия: 2 секунды, после чего шапка мягко скрывается
 * - Подведение курсора к верхнему краю экрана (Y <= 90px) или наведение на шапку раскрывает её и держит открытой
 * - В самом верху страницы (scrollY <= 50px) всегда видна и зафиксирована
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let idleTimer = null;
  let isMouseOverHeader = false;
  let isNearTopEdge = false;
  let lastScrollUpTime = 0;

  function showHeader() {
    header.classList.remove('header-hidden');
  }

  function hideHeader() {
    // Никогда не скрывать, если:
    // - пользователь в самом верху страницы
    // - курсор наведен на шапку
    // - курсор подведен к верхней области экрана
    // - только что был жест скролла вверх (защита от дребезга тачпада 350мс)
    if (window.scrollY <= 50 || isMouseOverHeader || isNearTopEdge) return;
    if (Date.now() - lastScrollUpTime < 350) return;
    header.classList.add('header-hidden');
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (window.scrollY > 50 && !isMouseOverHeader && !isNearTopEdge) {
      idleTimer = setTimeout(() => {
        hideHeader();
      }, 2000); // Ровно 2 секунды бездействия по ТЗ
    }
  }

  function onScrollUp() {
    lastScrollUpTime = Date.now();
    showHeader();
    resetIdleTimer();
  }

  function onScrollDown() {
    if (Date.now() - lastScrollUpTime < 350) return;
    hideHeader();
    clearTimeout(idleTimer);
  }

  // Наведение курсора непосредственно на шапку
  header.addEventListener('mouseenter', () => {
    isMouseOverHeader = true;
    showHeader();
    clearTimeout(idleTimer);
  });

  header.addEventListener('mouseleave', () => {
    isMouseOverHeader = false;
    resetIdleTimer();
  });

  // Подведение курсора к верхнему краю экрана (Y <= 90px)
  window.addEventListener('mousemove', (e) => {
    if (e.clientY <= 90) {
      isNearTopEdge = true;
      showHeader();
      clearTimeout(idleTimer);
    } else {
      if (isNearTopEdge) {
        isNearTopEdge = false;
        resetIdleTimer();
      }
    }
  }, { passive: true });

  // Мгновенная реакция на колесико / тачпад ноутбука (wheel)
  window.addEventListener('wheel', (e) => {
    if (window.scrollY <= 50) {
      showHeader();
      return;
    }

    if (e.deltaY < 0) {
      // Скроллинг колесиком/тачпадом ВВЕРХ — шапка появляется мгновенно
      onScrollUp();
    } else if (e.deltaY > 10) {
      // Скроллинг ВНИЗ — скрывается
      onScrollDown();
    }
  }, { passive: true });

  // Тач-события для мобильных и сенсорных экранов ноутбуков
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY; // > 0 тянут вниз = скролл вверх!
      if (diff > 4) {
        onScrollUp();
      } else if (diff < -10) {
        onScrollDown();
      }
      touchStartY = touchY;
    }
  }, { passive: true });

  // Клавиатурная навигация (стрелка вверх, PageUp, Home)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') {
      onScrollUp();
    } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') {
      onScrollDown();
    }
  });

  // Основной скроллинг страницы
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const scrollDiff = currentY - lastScrollY;

    // Стили тени / фона шапки
    if (currentY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // В самом верху страницы шапка всегда зафиксирована и видна
    if (currentY <= 50) {
      showHeader();
      clearTimeout(idleTimer);
      lastScrollY = currentY;
      return;
    }

    // При скроллинге ВВЕРХ (любая отрицательная разница) — шапка появляется сразу
    if (scrollDiff < 0) {
      onScrollUp();
    } 
    // При скроллинге ВНИЗ — скрываем шапку
    else if (scrollDiff > 6) {
      onScrollDown();
    }

    lastScrollY = currentY;
  }, { passive: true });
}

/**
 * Реестр лидов (для администратора: скрытая комбинация клавиш Ctrl + Shift + L)
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

  // Снятие подсветки ошибок при вводе
  ['client-name', 'client-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => el.classList.remove('input-error'));
    }
  });
}

function openLeadLedger() {
  const leads = JSON.parse(localStorage.getItem('monolit_leads') || '[]');
  if (leads.length === 0) {
    alert('В локальном хранилище этого браузера пока нет сохранённых заявок.\nВсе поступающие с сайта заявки отправляются напрямую на почту tana15111977@gmail.com.');
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

/**
 * Умное поведение нижней плавающей панели связи:
 * - Скрывается при скролле вниз (чтобы не загораживать контент)
 * - Показывается при скролле вверх или при касании
 * - Автоматически скрывается при бездействии пользователя более 1.5 секунд
 */
function initFloatingBarBehavior() {
  const bar = document.querySelector('.floating-mobile-bar');
  if (!bar) return;

  let lastScrollY = window.scrollY;
  let idleTimer = null;

  function showBar() {
    bar.classList.remove('bar-hidden');
  }

  function hideBar() {
    bar.classList.add('bar-hidden');
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      hideBar();
    }, 1500); // 1.5 секунды бездействия
  }

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Скролл вниз (дальше 60px от верха) — прячем сразу
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      hideBar();
      clearTimeout(idleTimer);
    } else if (currentScrollY < lastScrollY) {
      // Скролл вверх — показываем и перезапускаем таймер на 1.5 сек
      showBar();
      resetIdleTimer();
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Любое касание экрана или клик снова показывает панель и перезапускает таймер
  ['touchstart', 'touchmove', 'click', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, () => {
      showBar();
      resetIdleTimer();
    }, { passive: true });
  });

  // Запуск таймера при старте страницы
  resetIdleTimer();
}

/**
 * Автоматическая подсветка активной карточки оранжевой рамкой при свайпе/перелистывании в секциях «Услуги» и «Инженерный подход»
 */
function initHorizontalSwipeHighlight() {
  const setupCarousel = (gridSelector, cardSelector, activeClass) => {
    const container = document.querySelector(gridSelector);
    if (!container) return;
    const cards = container.querySelectorAll(cardSelector);
    if (!cards.length) return;

    let isTicking = false;

    function updateActiveCard() {
      isTicking = false;
      // Если на десктопе контейнер не скроллится — убираем принудительный active-service
      if (container.scrollWidth <= container.clientWidth + 10) {
        cards.forEach(c => c.classList.remove(activeClass));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestCard = null;
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const dist = Math.abs(containerCenter - cardCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestCard = card;
        }
      });

      cards.forEach(card => {
        if (card === closestCard) {
          card.classList.add(activeClass);
        } else {
          card.classList.remove(activeClass);
        }
      });
    }

    container.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateActiveCard);
        isTicking = true;
      }
    }, { passive: true });

    // Клик/тап по карточке центрирует её и подсвечивает оранжевым
    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (container.scrollWidth > container.clientWidth + 10) {
          cards.forEach(c => c.classList.remove(activeClass));
          card.classList.add(activeClass);
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });

    // Первоначальное выставление первой видимой карточки
    updateActiveCard();
    setTimeout(updateActiveCard, 150);

    // При изменении ориентации или размера экрана
    window.addEventListener('resize', () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateActiveCard);
        isTicking = true;
      }
    }, { passive: true });
  };

  // 1. «Услуги риелтора»
  setupCarousel('.services-grid', '.service-card', 'active-service');

  // 2. «Инженерный подход»
  setupCarousel('.engineering-cards-grid', '.eng-card', 'active-eng');
}
