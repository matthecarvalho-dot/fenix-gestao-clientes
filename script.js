// script.js - Sistema Fênix Gestão de Clientes

// Configuração do Sistema
const APP_CONFIG = {
    name: 'Fênix Gestão de Clientes',
    version: '2.0',
    colors: {
        primary: '#1a365d',
        secondary: '#d4af37',
        accent: '#2c5282'
    }
};

// Estado Global
let currentUser = null;
let clients = [];
let currentView = 'login';
let editingClientId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} inicializando...`);
    
    checkGitHubPages();
    loadAppData();
    renderApp();
    setupEventListeners();
    
    // Mostrar mensagem de boas-vindas
    if (isFirstAccess()) {
        showWelcomeMessage();
    }
});

// Verificar se está no GitHub Pages
function checkGitHubPages() {
    const isGitHub = window.location.hostname.includes('github.io');
    const githubLink = document.getElementById('github-link');
    
    if (isGitHub && githubLink) {
        const repoUrl = window.location.href.replace(/\/[^\/]*$/, '');
        githubLink.href = repoUrl;
        githubLink.target = '_blank';
        githubLink.innerHTML = '<i class="fab fa-github"></i> Ver Código no GitHub';
    }
}

// Carregar dados do localStorage
function loadAppData() {
    // Carregar usuário
    const savedUser = localStorage.getItem('fenixUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    // Carregar clientes
    const savedClients = localStorage.getItem('fenixClients');
    if (savedClients) {
        clients = JSON.parse(savedClients);
    } else {
        // Dados de exemplo para demonstração
        initializeSampleData();
    }
}

// Inicializar dados de exemplo
function initializeSampleData() {
    clients = [
        {
            id: '1',
            name: 'Tech Solutions Ltda',
            document: '12.345.678/0001-90',
            email: 'contato@techsolutions.com',
            phone: '(11) 9999-8888',
            service: 'Registro de Marca',
            status: 'active',
            notes: 'Cliente corporativo',
            registrationDate: '2023-01-15T10:30:00.000Z'
        },
        {
            id: '2',
            name: 'Maria Silva',
            document: '123.456.789-00',
            email: 'maria.silva@email.com',
            phone: '(21) 98877-6655',
            service: 'Registro de Patente',
            status: 'paid',
            notes: 'Patente concedida',
            registrationDate: '2022-11-20T14:45:00.000Z'
        }
    ];
    saveClients();
}

// Verificar primeiro acesso
function isFirstAccess() {
    return !localStorage.getItem('fenixFirstAccess');
}

// Mostrar mensagem de boas-vindas
function showWelcomeMessage() {
    localStorage.setItem('fenixFirstAccess', 'true');
    
    setTimeout(() => {
        alert(`Bem-vindo ao ${APP_CONFIG.name}!\n\nEste sistema permite gerenciar seus clientes de marcas e patentes de forma 100% online.`);
    }, 1000);
}

// Renderizar aplicativo
function renderApp() {
    const appContainer = document.getElementById('app-container');
    
    if (!currentUser) {
        currentView = 'login';
    }
    
    switch(currentView) {
        case 'login':
            appContainer.innerHTML = renderLoginScreen();
            break;
        case 'dashboard':
            appContainer.innerHTML = renderDashboard();
            updateDashboardStats();
            break;
        case 'clients':
            appContainer.innerHTML = renderClientsView();
            renderClientsTable();
            break;
        case 'import':
            appContainer.innerHTML = renderImportView();
            break;
        case 'settings':
            appContainer.innerHTML = renderSettingsView();
            break;
    }
    
    // Adicionar classe de animação
    appContainer.classList.add('fade-in');
}

// Tela de Login
function renderLoginScreen() {
    return `
        <div class="login-screen">
            <div class="login-box">
                <div class="logo-container">
                    <h1>Fênix <span>Gestão de Clientes</span></h1>
                    <p>Sistema completo para gestão de clientes de marcas e patentes</p>
                </div>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" class="form-control" placeholder="seu@email.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" class="form-control" placeholder="Sua senha" required>
                    </div>
                    
                    <div class="form-group mt-30">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-sign-in-alt"></i> Entrar no Sistema
                        </button>
                    </div>
                    
                    <div class="text-center mt-20">
                        <p>Primeiro acesso? Use qualquer e-mail e senha para criar sua conta.</p>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Dashboard
function renderDashboard() {
    return `
        <div class="dashboard-view">
            <div class="dashboard-header">
                <h2>Dashboard</h2>
                <div class="d-flex gap-10">
                    <button class="btn btn-gold" id="addClientBtn">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                    <button class="btn btn-primary" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </button>
                </div>
            </div>
            
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3>CLIENTES ATIVOS</h3>
                    <div class="card-number" id="activeCount">0</div>
                </div>
                
                <div class="card">
                    <div class="card-icon">
                        <i class="fas fa-user-times"></i>
                    </div>
                    <h3>CLIENTES CANCELADOS</h3>
                    <div class="card-number" id="cancelledCount">0</div>
                </div>
                
                <div class="card">
                    <div class="card-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <h3>CLIENTES QUITADOS</h3>
                    <div class="card-number" id="paidCount">0</div>
                </div>
                
                <div class="card">
                    <div class="card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>TOTAL DE CLIENTES</h3>
                    <div class="card-number" id="totalCount">0</div>
                </div>
            </div>
            
            <div class="table-container">
                <div class="d-flex justify-between align-center mb-20">
                    <h3>Clientes Recentes</h3>
                    <div class="nav-tabs">
                        <div class="nav-tab active" data-view="dashboard">Dashboard</div>
                        <div class="nav-tab" data-view="clients">Todos Clientes</div>
                        <div class="nav-tab" data-view="import">Importar</div>
                        <div class="nav-tab" data-view="settings">Configurações</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Nome/Razão Social</th>
                            <th>CPF/CNPJ</th>
                            <th>Serviço</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="recentClientsTable">
                        <!-- Carregado via JavaScript -->
                    </tbody>
                </table>
                
                <div id="noClientsMessage" class="d-none text-center mt-30">
                    <i class="fas fa-users fa-3x mb-20" style="color: var(--cinza);"></i>
                    <h3>Nenhum cliente cadastrado</h3>
                    <p class="mt-10">Adicione seu primeiro cliente para começar</p>
                    <button class="btn btn-gold mt-20" id="addFirstClient">
                        <i class="fas fa-plus"></i> Adicionar Cliente
                    </button>
                </div>
            </div>
            
            <div class="mt-30 text-center">
                <p class="mb-10">💡 <strong>Dica:</strong> Use o menu acima para navegar entre as seções do sistema</p>
                <p><i class="fas fa-cloud"></i> Dados armazenados localmente no navegador</p>
            </div>
        </div>
    `;
}

// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    const activeCount = clients.filter(c => c.status === 'active').length;
    const cancelledCount = clients.filter(c => c.status === 'cancelled').length;
    const paidCount = clients.filter(c => c.status === 'paid').length;
    const totalCount = clients.length;
    
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('cancelledCount').textContent = cancelledCount;
    document.getElementById('paidCount').textContent = paidCount;
    document.getElementById('totalCount').textContent = totalCount;
    
    // Atualizar tabela de clientes recentes
    renderRecentClients();
}

// Renderizar clientes recentes
function renderRecentClients() {
    const tableBody = document.getElementById('recentClientsTable');
    const noClientsMsg = document.getElementById('noClientsMessage');
    
    if (!tableBody) return;
    
    if (clients.length === 0) {
        tableBody.innerHTML = '';
        if (noClientsMsg) noClientsMsg.classList.remove('d-none');
        return;
    }
    
    if (noClientsMsg) noClientsMsg.classList.add('d-none');
    
    // Ordenar por data (mais recentes primeiro)
    const recentClients = [...clients]
        .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
        .slice(0, 5);
    
    tableBody.innerHTML = recentClients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.document}</td>
            <td>${client.service || '---'}</td>
            <td><span class="status-badge status-${client.status}">
                ${client.status === 'active' ? 'Ativo' : 
                  client.status === 'cancelled' ? 'Cancelado' : 'Quitado'}
            </span></td>
            <td>
                <button class="btn btn-outline" onclick="editClient('${client.id}')" style="padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// View de Clientes
function renderClientsView() {
    return `
        <div class="clients-view">
            <div class="dashboard-header">
                <h2>Gestão de Clientes</h2>
                <div class="d-flex gap-10">
                    <button class="btn btn-gold" id="importClientsBtn">
                        <i class="fas fa-file-import"></i> Importar
                    </button>
                    <button class="btn btn-primary" id="addClientBtn2">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <div class="mb-20">
                    <input type="text" id="searchClient" class="form-control" placeholder="Buscar cliente...">
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Nome/Razão Social</th>
                            <th>CPF/CNPJ</th>
                            <th>Contato</th>
                            <th>Serviço</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="allClientsTable">
                        <!-- Carregado via JavaScript -->
                    </tbody>
                </table>
                
                <div id="emptyClientsMessage" class="text-center mt-30 d-none">
                    <i class="fas fa-users fa-3x mb-20" style="color: var(--cinza);"></i>
                    <h3>Nenhum cliente cadastrado</h3>
                </div>
            </div>
            
            <div class="nav-tabs mt-30">
                <div class="nav-tab" data-view="dashboard">Dashboard</div>
                <div class="nav-tab active" data-view="clients">Todos Clientes</div>
                <div class="nav-tab" data-view="import">Importar</div>
                <div class="nav-tab" data-view="settings">Configurações</div>
            </div>
        </div>
    `;
}

// Renderizar tabela completa de clientes
function renderClientsTable() {
    const tableBody = document.getElementById('allClientsTable');
    const emptyMsg = document.getElementById('emptyClientsMessage');
    
    if (!tableBody) return;
    
    if (clients.length === 0) {
        tableBody.innerHTML = '';
        if (emptyMsg) emptyMsg.classList.remove('d-none');
        return;
    }
    
    if (emptyMsg) emptyMsg.classList.add('d-none');
    
    tableBody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.document}</td>
            <td>
                ${client.email ? `${client.email}<br>` : ''}
                ${client.phone || ''}
            </td>
            <td>${client.service || '---'}</td>
            <td><span class="status-badge status-${client.status}">
                ${client.status === 'active' ? 'Ativo' : 
                  client.status === 'cancelled' ? 'Cancelado' : 'Quitado'}
            </span></td>
            <td>
                <button class="btn btn-outline" onclick="editClient('${client.id}')" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="deleteClient('${client.id}')" style="padding: 5px 10px; font-size: 12px; color: #e53e3e;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// View de Importação
function renderImportView() {
    return `
        <div class="import-view">
            <div class="dashboard-header">
                <h2>Importação de Clientes</h2>
                <div class="d-flex gap-10">
                    <button class="btn btn-primary" onclick="navigateTo('dashboard')">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                </div>
            </div>
            
            <div class="card mb-30">
                <h3 class="mb-15">Como importar sua planilha</h3>
                <ol style="margin-left: 20px; line-height: 2;">
                    <li>Exporte seus clientes da sua planilha atual para CSV ou Excel</li>
                    <li>Clique no botão abaixo para selecionar o arquivo</li>
                    <li>O sistema tentará identificar automaticamente as colunas</li>
                    <li>Revise os dados antes de confirmar a importação</li>
                </ol>
            </div>
            
            <div class="card text-center">
                <i class="fas fa-file-excel fa-3x mb-20" style="color: var(--dourado);"></i>
                <h3 class="mb-10">Arraste e solte sua planilha aqui</h3>
                <p class="mb-20">Ou clique para selecionar um arquivo</p>
                
                <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" class="d-none">
                <button class="btn btn-gold mb-20" id="browseFileBtn">
                    <i class="fas fa-folder-open"></i> Selecionar Arquivo
                </button>
                
                <p class="text-small">Formatos suportados: CSV, Excel (.xlsx, .xls)</p>
            </div>
            
            <div class="nav-tabs mt-30">
                <div class="nav-tab" data-view="dashboard">Dashboard</div>
                <div class="nav-tab" data-view="clients">Todos Clientes</div>
                <div class="nav-tab active" data-view="import">Importar</div>
                <div class="nav-tab" data-view="settings">Configurações</div>
            </div>
        </div>
    `;
}

// View de Configurações
function renderSettingsView() {
    const companyName = currentUser?.company || 'Sua Empresa';
    
    return `
        <div class="settings-view">
            <div class="dashboard-header">
                <h2>Configurações do Sistema</h2>
                <button class="btn btn-primary" onclick="navigateTo('dashboard')">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
            
            <div class="card mb-30">
                <h3 class="mb-20">Informações da Empresa</h3>
                
                <div class="form-group">
                    <label for="companyName">Nome da Empresa</label>
                    <input type="text" id="companyName" class="form-control" value="${companyName}">
                </div>
                
                <div class="form-group">
                    <label for="companyEmail">E-mail</label>
                    <input type="email" id="companyEmail" class="form-control" value="${currentUser?.email || ''}">
                </div>
                
                <button class="btn btn-primary mt-10" onclick="saveCompanyInfo()">
                    <i class="fas fa-save"></i> Salvar Informações
                </button>
            </div>
            
            <div class="card mb-30">
                <h3 class="mb-20">Backup e Restauração</h3>
                
                <p class="mb-20">Faça backup dos seus dados para não perdê-los.</p>
                
                <div class="d-flex gap-10">
                    <button class="btn btn-gold" onclick="exportData()">
                        <i class="fas fa-download"></i> Exportar Dados
                    </button>
                    <button class="btn btn-outline" onclick="importData()">
                        <i class="fas fa-upload"></i> Importar Dados
                    </button>
                </div>
            </div>
            
            <div class="card">
                <h3 class="mb-20">Sobre o Sistema</h3>
                
                <p><strong>${APP_CONFIG.name}</strong> v${APP_CONFIG.version}</p>
                <p class="mt-10">Sistema 100% online para gestão de clientes de marcas e patentes</p>
                <p class="mt-10">Desenvolvido para funcionar no GitHub Pages</p>
                
                <div class="mt-20">
                    <button class="btn btn-outline" onclick="showHelp()">
                        <i class="fas fa-question-circle"></i> Ajuda
                    </button>
                </div>
            </div>
            
            <div class="nav-tabs mt-30">
                <div class="nav-tab" data-view="dashboard">Dashboard</div>
                <div class="nav-tab" data-view="clients">Todos Clientes</div>
                <div class="nav-tab" data-view="import">Importar</div>
                <div class="nav-tab active" data-view="settings">Configurações</div>
            </div>
        </div>
    `;
}

// Configurar event listeners
function setupEventListeners() {
    // Event delegation para navegação
    document.addEventListener('click', function(e) {
        // Navegação por tabs
        if (e.target.classList.contains('nav-tab')) {
            const view = e.target.getAttribute('data-view');
            navigateTo(view);
        }
        
        // Botões de ação
        if (e.target.id === 'addClientBtn' || e.target.id === 'addClientBtn2' || e.target.id === 'addFirstClient') {
            openClientModal();
        }
        
        if (e.target.id === 'logoutBtn') {
            logout();
        }
        
        if (e.target.id === 'importClientsBtn') {
            navigateTo('import');
        }
        
        if (e.target.id === 'browseFileBtn') {
            document.getElementById('fileInput').click();
        }
    });
    
    // Formulário de login
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'loginForm') {
            e.preventDefault();
            handleLogin();
        }
    });
    
    // Busca de clientes
    document.addEventListener('input', function(e) {
        if (e.target.id === 'searchClient') {
            searchClients(e.target.value);
        }
    });
    
    // Upload de arquivo
    document.addEventListener('change', function(e) {
        if (e.target.id === 'fileInput') {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Login
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Criar usuário
    currentUser = {
        email: email,
        company: email.split('@')[0],
        loginDate: new Date().toISOString()
    };
    
    // Salvar no localStorage
    localStorage.setItem('fenixUser', JSON.stringify(currentUser));
    
    // Navegar para o dashboard
    currentView = 'dashboard';
    renderApp();
}

// Logout
function logout() {
    if (confirm('Deseja sair do sistema?')) {
        currentUser = null;
        currentView = 'login';
        renderApp();
    }
}

// Navegação
function navigateTo(view) {
    currentView = view;
    renderApp();
}

// Abrir modal de cliente
function openClientModal(clientId = null) {
    editingClientId = clientId;
    
    let client = null;
    if (clientId) {
        client = clients.find(c => c.id === clientId);
    }
    
    const modalHtml = `
        <div class
