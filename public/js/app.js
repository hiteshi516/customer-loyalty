const api = {
  auth: '/api/auth',
  customers: '/api/customers',
  purchase: '/api/purchase',
  redeem: '/api/redeem',
  transactions: '/api/transactions',
  dashboard: '/api/dashboard'
};

const readStoredUser = () => {
  try {
    const value = localStorage.getItem('loyalty_user');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    localStorage.removeItem('loyalty_user');
    localStorage.removeItem('loyalty_token');
    return null;
  }
};

const state = {
  customers: [],
  editingCustomerId: null,
  authMode: 'login',
  token: localStorage.getItem('loyalty_token') || '',
  user: readStoredUser()
};

const pageTitles = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  purchase: 'Add Purchase',
  redeem: 'Redeem Points',
  transactions: 'Transactions'
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const els = {
  marketingPage: document.querySelector('#marketingPage'),
  authPage: document.querySelector('#authPage'),
  appShell: document.querySelector('#appShell'),
  openAuthBtns: document.querySelectorAll('[data-open-auth]'),
  backToLandingBtn: document.querySelector('#backToLandingBtn'),
  exploreBtn: document.querySelector('#exploreBtn'),
  authTabs: document.querySelectorAll('.auth-tab'),
  authForm: document.querySelector('#authForm'),
  authTitle: document.querySelector('#authTitle'),
  authEyebrow: document.querySelector('#authEyebrow'),
  authSubmitBtn: document.querySelector('#authSubmitBtn'),
  signupOnly: document.querySelector('.signup-only'),
  googleButton: document.querySelector('#googleButton'),
  googleNote: document.querySelector('#googleNote'),
  pointsRange: document.querySelector('#pointsRange'),
  calcAmount: document.querySelector('#calcAmount'),
  calcPoints: document.querySelector('#calcPoints'),
  logoutBtn: document.querySelector('#logoutBtn'),
  userPill: document.querySelector('#userPill'),
  pageTitle: document.querySelector('#pageTitle'),
  navLinks: document.querySelectorAll('.nav-link'),
  views: document.querySelectorAll('.view'),
  toast: document.querySelector('#toast'),
  quickAddBtn: document.querySelector('#quickAddBtn'),
  customerDialog: document.querySelector('#customerDialog'),
  closeDialogBtn: document.querySelector('#closeDialogBtn'),
  cancelDialogBtn: document.querySelector('#cancelDialogBtn'),
  customerForm: document.querySelector('#customerForm'),
  customerFormTitle: document.querySelector('#customerFormTitle'),
  customerTable: document.querySelector('#customerTable'),
  customerCount: document.querySelector('#customerCount'),
  searchInput: document.querySelector('#searchInput'),
  sortSelect: document.querySelector('#sortSelect'),
  purchaseForm: document.querySelector('#purchaseForm'),
  redeemForm: document.querySelector('#redeemForm'),
  transactionType: document.querySelector('#transactionType'),
  transactionTable: document.querySelector('#transactionTable'),
  recentTransactions: document.querySelector('#recentTransactions'),
  topCustomers: document.querySelector('#topCustomers'),
  totalCustomers: document.querySelector('#totalCustomers'),
  pointsIssued: document.querySelector('#pointsIssued'),
  pointsRedeemed: document.querySelector('#pointsRedeemed'),
  purchaseRevenue: document.querySelector('#purchaseRevenue')
};

const request = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) logout(false);
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const showToast = (message) => {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.setTimeout(() => els.toast.classList.remove('show'), 3200);
};

const openAuthScreen = (mode) => {
  setAuthMode(mode);
  setScreen('auth');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const setScreen = (screen) => {
  els.marketingPage.classList.toggle('hidden', screen !== 'landing');
  els.authPage.classList.toggle('hidden', screen !== 'auth');
  els.appShell.classList.toggle('hidden', screen !== 'app');
};

const setAuthMode = (mode) => {
  state.authMode = mode;
  const isSignup = mode === 'signup';

  els.authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.authMode === mode));
  els.signupOnly.classList.toggle('hidden', !isSignup);
  els.signupOnly.querySelector('input').required = isSignup;
  els.authTitle.textContent = isSignup ? 'Create your loyalty workspace' : 'Login to your workspace';
  els.authEyebrow.textContent = isSignup ? 'Start in seconds' : 'Welcome back';
  els.authSubmitBtn.textContent = isSignup ? 'Create Account' : 'Login';
};

const saveSession = ({ token, user }) => {
  state.token = token;
  state.user = user;
  localStorage.setItem('loyalty_token', token);
  localStorage.setItem('loyalty_user', JSON.stringify(user));
};

const enterApp = async () => {
  els.userPill.textContent = state.user?.name || 'User';
  setScreen('app');
  await refreshAll();
};

const logout = (notify = true) => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('loyalty_token');
  localStorage.removeItem('loyalty_user');
  setScreen('landing');
  if (notify) showToast('Logged out successfully');
};

const getCustomerName = (transaction) => {
  if (!transaction.customerId) return 'Deleted customer';
  return transaction.customerId.name || 'Customer';
};

const renderEmpty = (target, message, columns = 1) => {
  target.innerHTML = `<tr><td colspan="${columns}" class="empty">${message}</td></tr>`;
};

const loadCustomers = async () => {
  const params = new URLSearchParams({
    search: els.searchInput.value.trim(),
    sort: els.sortSelect.value
  });
  state.customers = await request(`${api.customers}?${params}`);
  renderCustomers();
  renderCustomerOptions();
};

const renderCustomers = () => {
  els.customerCount.textContent = `${state.customers.length} customer${state.customers.length === 1 ? '' : 's'}`;

  if (!state.customers.length) {
    renderEmpty(els.customerTable, 'No customers found. Add your first customer to begin.', 6);
    return;
  }

  els.customerTable.innerHTML = state.customers.map((customer) => `
    <tr>
      <td><strong>${customer.name}</strong><span>${customer._id}</span></td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td><strong>${customer.loyaltyPoints}</strong></td>
      <td>${formatDate(customer.joinDate)}</td>
      <td>
        <div class="row-actions">
          <button class="ghost-btn" data-edit="${customer._id}">Edit</button>
          <button class="danger-btn" data-delete="${customer._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderCustomerOptions = () => {
  const options = state.customers.map((customer) => (
    `<option value="${customer._id}">${customer.name} - ${customer.loyaltyPoints} pts</option>`
  )).join('');

  document.querySelectorAll('select[name="customerId"]').forEach((select) => {
    select.innerHTML = options || '<option value="">Add a customer first</option>';
  });
};

const loadDashboard = async () => {
  const dashboard = await request(api.dashboard);

  els.totalCustomers.textContent = dashboard.totalCustomers;
  els.pointsIssued.textContent = dashboard.totalPointsIssued;
  els.pointsRedeemed.textContent = dashboard.totalPointsRedeemed;
  els.purchaseRevenue.textContent = currency.format(dashboard.totalPurchaseAmount);

  els.recentTransactions.innerHTML = dashboard.recentTransactions.length
    ? dashboard.recentTransactions.map((transaction) => `
      <article class="list-item">
        <div>
          <strong>${getCustomerName(transaction)}</strong>
          <span>${transaction.type} - ${formatDate(transaction.date)}</span>
        </div>
        <span class="badge ${transaction.type.toLowerCase()}">${transaction.points} pts</span>
      </article>
    `).join('')
    : '<p class="empty">No transactions yet.</p>';

  els.topCustomers.innerHTML = dashboard.topCustomers.length
    ? dashboard.topCustomers.map((customer, index) => `
      <article class="list-item">
        <div>
          <strong>#${index + 1} ${customer.name}</strong>
          <span>${customer.email}</span>
        </div>
        <span class="badge purchase">${customer.loyaltyPoints} pts</span>
      </article>
    `).join('')
    : '<p class="empty">No customers yet.</p>';
};

const loadTransactions = async () => {
  const params = new URLSearchParams({ limit: '100' });
  if (els.transactionType.value) params.set('type', els.transactionType.value);

  const transactions = await request(`${api.transactions}?${params}`);

  if (!transactions.length) {
    renderEmpty(els.transactionTable, 'No transactions found.', 6);
    return;
  }

  els.transactionTable.innerHTML = transactions.map((transaction) => `
    <tr>
      <td><strong>${getCustomerName(transaction)}</strong><span>${transaction.customerId?.email || ''}</span></td>
      <td><span class="badge ${transaction.type.toLowerCase()}">${transaction.type}</span></td>
      <td>${transaction.amount ? currency.format(transaction.amount) : '-'}</td>
      <td>${transaction.points}</td>
      <td>${transaction.balanceAfter}</td>
      <td>${formatDate(transaction.date)}</td>
    </tr>
  `).join('');
};

const refreshAll = async () => {
  await loadCustomers();
  await Promise.all([loadDashboard(), loadTransactions()]);
};

const switchView = async (viewName) => {
  els.pageTitle.textContent = pageTitles[viewName];
  els.navLinks.forEach((link) => link.classList.toggle('active', link.dataset.view === viewName));
  els.views.forEach((view) => view.classList.toggle('active', view.id === `${viewName}View`));

  if (viewName === 'dashboard') await loadDashboard();
  if (viewName === 'customers') await loadCustomers();
  if (viewName === 'transactions') await loadTransactions();
};

const openCustomerDialog = (customer = null) => {
  state.editingCustomerId = customer?._id || null;
  els.customerFormTitle.textContent = customer ? 'Edit Customer' : 'Add Customer';
  els.customerForm.elements.id.value = customer?._id || '';
  els.customerForm.elements.name.value = customer?.name || '';
  els.customerForm.elements.email.value = customer?.email || '';
  els.customerForm.elements.phone.value = customer?.phone || '';
  els.customerDialog.showModal();
};

const closeCustomerDialog = () => {
  els.customerDialog.close();
  els.customerForm.reset();
  state.editingCustomerId = null;
};

const initGoogle = async (attempt = 0) => {
  try {
    const { clientId } = await request(`${api.auth}/google-config`);

    if (!clientId) {
      els.googleNote.textContent = 'Google Sign-In needs a Client ID in .env.';
      return;
    }

    if (!window.google?.accounts?.id) {
      if (attempt < 8) {
        window.setTimeout(() => initGoogle(attempt + 1), 450);
      }
      return;
    }

    els.googleNote.textContent = 'Google Sign-In is ready.';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const session = await request(`${api.auth}/google`, {
            method: 'POST',
            body: JSON.stringify({ credential: response.credential })
          });
          saveSession(session);
          showToast('Signed in with Google');
          await enterApp();
        } catch (error) {
          showToast(error.message);
        }
      }
    });

    window.google.accounts.id.renderButton(els.googleButton, {
      theme: 'outline',
      size: 'large',
      width: Math.min(360, els.googleButton.clientWidth || 360)
    });
  } catch (error) {
    els.googleNote.textContent = 'Google Sign-In could not be loaded right now.';
  }
};

document.addEventListener('click', (event) => {
  const authButton = event.target.closest('[data-open-auth]');

  if (authButton) {
    openAuthScreen(authButton.dataset.openAuth);
  }
});

els.backToLandingBtn.addEventListener('click', () => setScreen('landing'));
els.exploreBtn.addEventListener('click', () => document.querySelector('#features').scrollIntoView({ behavior: 'smooth' }));
els.authTabs.forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));
els.logoutBtn.addEventListener('click', () => logout());

els.authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(els.authForm);
  const isSignup = state.authMode === 'signup';
  const payload = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  if (isSignup) payload.name = formData.get('name');

  try {
    const session = await request(`${api.auth}/${isSignup ? 'signup' : 'login'}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    saveSession(session);
    els.authForm.reset();
    showToast(isSignup ? 'Account created successfully' : 'Logged in successfully');
    await enterApp();
  } catch (error) {
    showToast(error.message);
  }
});

els.navLinks.forEach((link) => {
  link.addEventListener('click', () => switchView(link.dataset.view).catch((error) => showToast(error.message)));
});

els.quickAddBtn.addEventListener('click', () => openCustomerDialog());
els.closeDialogBtn.addEventListener('click', closeCustomerDialog);
els.cancelDialogBtn.addEventListener('click', closeCustomerDialog);

els.customerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(els.customerForm);
  const id = formData.get('id');
  const body = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone')
  };

  try {
    await request(id ? `${api.customers}/${id}` : api.customers, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
    closeCustomerDialog();
    showToast(id ? 'Customer updated successfully' : 'Customer registered successfully');
    await refreshAll();
  } catch (error) {
    showToast(error.message);
  }
});

els.customerTable.addEventListener('click', async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const customer = state.customers.find((item) => item._id === editId);
    openCustomerDialog(customer);
  }

  if (deleteId && confirm('Delete this customer and all related transactions?')) {
    try {
      await request(`${api.customers}/${deleteId}`, { method: 'DELETE' });
      showToast('Customer deleted');
      await refreshAll();
    } catch (error) {
      showToast(error.message);
    }
  }
});

els.purchaseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(els.purchaseForm);

  try {
    await request(api.purchase, {
      method: 'POST',
      body: JSON.stringify({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        note: formData.get('note')
      })
    });
    els.purchaseForm.reset();
    showToast('Purchase saved and points awarded');
    await refreshAll();
  } catch (error) {
    showToast(error.message);
  }
});

els.redeemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(els.redeemForm);

  try {
    await request(api.redeem, {
      method: 'POST',
      body: JSON.stringify({
        customerId: formData.get('customerId'),
        points: Number(formData.get('points')),
        note: formData.get('note')
      })
    });
    els.redeemForm.reset();
    showToast('Reward redeemed successfully');
    await refreshAll();
  } catch (error) {
    showToast(error.message);
  }
});

els.searchInput.addEventListener('input', () => loadCustomers().catch((error) => showToast(error.message)));
els.sortSelect.addEventListener('change', () => loadCustomers().catch((error) => showToast(error.message)));
els.transactionType.addEventListener('change', () => loadTransactions().catch((error) => showToast(error.message)));

const updateCalculator = () => {
  if (!els.pointsRange) return;

  const amount = Number(els.pointsRange.value);
  const points = Math.floor(amount / 100) * 10;
  els.calcAmount.textContent = currency.format(amount);
  els.calcPoints.textContent = points;
};

const initScrollReveal = () => {
  const items = document.querySelectorAll('.reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  items.forEach((item) => observer.observe(item));
};

els.pointsRange?.addEventListener('input', updateCalculator);
updateCalculator();
initScrollReveal();
setAuthMode('login');
initGoogle();

if (state.token && state.user) {
  enterApp().catch((error) => {
    showToast(error.message);
    logout(false);
  });
} else {
  setScreen('landing');
}
