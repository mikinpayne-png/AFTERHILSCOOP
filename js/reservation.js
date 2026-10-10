(function () {
  'use strict';

  // Remplacez cette valeur si le numéro WhatsApp de réception change.
  const WHATSAPP_NUMBER = '2250586934785';

  const PASSES = {
    PASS: { label: 'PASS', price: 4000 },
    VIP: { label: 'VIP', price: 5000 },
    VVIP: { label: 'VVIP', price: 10000 }
  };

  function formatPrice(value) {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  }

  function createModal() {
    if (document.getElementById('reservationModal')) return;

    const modal = document.createElement('div');
    modal.id = 'reservationModal';
    modal.className = 'reservation-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="reservation-backdrop" data-reservation-close></div>
      <div class="reservation-dialog" role="dialog" aria-modal="true" aria-labelledby="reservationTitle">
        <button type="button" class="reservation-close" aria-label="Fermer" data-reservation-close>&times;</button>
        <div class="reservation-header">
          <span class="reservation-kicker">NIGHT EVENT ONE</span>
          <h2 id="reservationTitle">R&eacute;server votre pass</h2>
          <p>Remplissez vos informations pour continuer sur WhatsApp.</p>
        </div>
        <form id="reservationForm" novalidate>
          <label for="reservationName">Nom complet <sup>*</sup></label>
          <input id="reservationName" name="name" type="text" autocomplete="name" required placeholder="Votre nom complet">

          <label for="reservationWhatsapp">Num&eacute;ro WhatsApp <sup>*</sup></label>
          <input id="reservationWhatsapp" name="whatsapp" type="tel" autocomplete="tel" required placeholder="Ex. 07 06 79 75 75">

          <label for="reservationPass">Pass s&eacute;lectionn&eacute; <sup>*</sup></label>
          <select id="reservationPass" name="pass" required>
            <option value="PASS">PASS &mdash; 4 000 FCFA</option>
            <option value="VIP">VIP &mdash; 5 000 FCFA</option>
            <option value="VVIP">VVIP &mdash; 10 000 FCFA</option>
          </select>

          <label for="reservationQuantity">Quantit&eacute; <sup>*</sup></label>
          <div class="reservation-quantity">
            <button type="button" id="quantityMinus" aria-label="Diminuer la quantit&eacute;">&minus;</button>
            <input id="reservationQuantity" name="quantity" type="number" value="1" min="1" step="1" inputmode="numeric" required>
            <button type="button" id="quantityPlus" aria-label="Augmenter la quantit&eacute;">+</button>
          </div>

          <div class="reservation-total">
            <span>Total</span>
            <strong id="reservationTotal">4 000 FCFA</strong>
          </div>
          <p id="reservationError" class="reservation-error" role="alert"></p>

          <div class="reservation-actions">
            <button type="button" class="reservation-cancel" data-reservation-close>Annuler</button>
            <button type="submit" class="reservation-submit"><i class="bi-whatsapp"></i> Continuer sur WhatsApp</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const form = document.getElementById('reservationForm');
    const passSelect = document.getElementById('reservationPass');
    const quantityInput = document.getElementById('reservationQuantity');
    const total = document.getElementById('reservationTotal');
    const error = document.getElementById('reservationError');

    function updateTotal() {
      const pass = PASSES[passSelect.value];
      let quantity = parseInt(quantityInput.value, 10);
      if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
      quantityInput.value = quantity;
      total.textContent = formatPrice(pass.price * quantity);
    }

    function openModal(selectedPass) {
      if (selectedPass && PASSES[selectedPass]) passSelect.value = selectedPass;
      quantityInput.value = 1;
      error.textContent = '';
      updateTotal();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('reservation-open');
      setTimeout(function () { document.getElementById('reservationName').focus(); }, 100);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('reservation-open');
    }

    document.querySelectorAll('.js-reservation').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        openModal(button.dataset.pass || '');
      });
    });

    document.querySelectorAll('[data-reservation-close]').forEach(function (button) {
      button.addEventListener('click', closeModal);
    });

    passSelect.addEventListener('change', updateTotal);
    quantityInput.addEventListener('input', updateTotal);
    document.getElementById('quantityMinus').addEventListener('click', function () {
      quantityInput.value = Math.max(1, (parseInt(quantityInput.value, 10) || 1) - 1);
      updateTotal();
    });
    document.getElementById('quantityPlus').addEventListener('click', function () {
      quantityInput.value = (parseInt(quantityInput.value, 10) || 1) + 1;
      updateTotal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = document.getElementById('reservationName').value.trim();
      const whatsapp = document.getElementById('reservationWhatsapp').value.trim();
      const pass = PASSES[passSelect.value];
      const quantity = parseInt(quantityInput.value, 10);

      if (!name || !whatsapp || !pass || !Number.isInteger(quantity) || quantity < 1) {
        error.textContent = 'Veuillez renseigner votre nom, votre WhatsApp et une quantit&eacute; valide.';
        return;
      }

      const totalPrice = pass.price * quantity;
      let message = [
        'Bonjour 👋',
        '',
        'Je souhaite réserver un Pass pour votre événement.',
        '',
        '👤 Nom : ' + name,
        '📱 WhatsApp : ' + whatsapp,
        '',
        '🎟️ Pass : ' + pass.label,
        '🔢 Quantité : ' + quantity,
        '💰 Prix unitaire : ' + formatPrice(pass.price),
        '💵 Total : ' + formatPrice(totalPrice)
      ];

      if (pass.label === 'VVIP') {
        message = message.concat([
          '',
          '🔥 PASS VVIP',
          '📅 Accès aux deux événements',
          "📍 Événements à Tiassalé/N'Douci selon les informations officielles du site"
        ]);
      }

      message = message.concat(['', 'Merci de me confirmer ma réservation.']);
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message.join('\n'));
      window.open(url, '_blank', 'noopener');
      closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModal);
  } else {
    createModal();
  }
})();
