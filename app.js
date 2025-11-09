// ===== GESTION DES DONNÉES =====

class DataManager {
    constructor() {
        this.users = this.loadUsers();
        this.deadlines = this.loadDeadlines();
    }

    // Charger les usagers depuis le localStorage
    loadUsers() {
        const data = localStorage.getItem('users');
        return data ? JSON.parse(data) : [];
    }

    // Sauvegarder les usagers dans le localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Charger les échéances depuis le localStorage
    loadDeadlines() {
        const data = localStorage.getItem('deadlines');
        return data ? JSON.parse(data) : [];
    }

    // Sauvegarder les échéances dans le localStorage
    saveDeadlines() {
        localStorage.setItem('deadlines', JSON.stringify(this.deadlines));
    }

    // === USAGERS ===

    addUser(userData) {
        const user = {
            id: Date.now().toString(),
            name: userData.name,
            notes: userData.notes || '',
            createdAt: new Date().toISOString()
        };
        this.users.push(user);
        this.saveUsers();
        return user;
    }

    updateUser(userId, userData) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users[index] = {
                ...this.users[index],
                name: userData.name,
                notes: userData.notes || ''
            };
            this.saveUsers();
            return this.users[index];
        }
        return null;
    }

    deleteUser(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        this.deadlines = this.deadlines.filter(d => d.userId !== userId);
        this.saveUsers();
        this.saveDeadlines();
    }

    getUser(userId) {
        return this.users.find(u => u.id === userId);
    }

    // === ÉCHÉANCES ===

    addDeadline(deadlineData) {
        const deadline = {
            id: Date.now().toString(),
            userId: deadlineData.userId,
            title: deadlineData.title,
            description: deadlineData.description || '',
            renewalDate: deadlineData.renewalDate,
            endDate: deadlineData.endDate,
            notificationDays: parseInt(deadlineData.notificationDays) || 30,
            createdAt: new Date().toISOString()
        };
        this.deadlines.push(deadline);
        this.saveDeadlines();
        return deadline;
    }

    updateDeadline(deadlineId, deadlineData) {
        const index = this.deadlines.findIndex(d => d.id === deadlineId);
        if (index !== -1) {
            this.deadlines[index] = {
                ...this.deadlines[index],
                title: deadlineData.title,
                description: deadlineData.description || '',
                renewalDate: deadlineData.renewalDate,
                endDate: deadlineData.endDate,
                notificationDays: parseInt(deadlineData.notificationDays) || 30
            };
            this.saveDeadlines();
            return this.deadlines[index];
        }
        return null;
    }

    deleteDeadline(deadlineId) {
        this.deadlines = this.deadlines.filter(d => d.id !== deadlineId);
        this.saveDeadlines();
    }

    getDeadlinesByUser(userId) {
        return this.deadlines.filter(d => d.userId === userId);
    }

    // === STATISTIQUES ===

    getStats() {
        const today = new Date();
        const urgentDays = 7; // Échéances dans moins de 7 jours
        const upcomingDays = 30; // Renouvellements dans moins de 30 jours

        let urgentCount = 0;
        let upcomingCount = 0;

        this.deadlines.forEach(deadline => {
            const endDate = new Date(deadline.endDate);
            const renewalDate = new Date(deadline.renewalDate);
            const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilEnd <= urgentDays && daysUntilEnd >= 0) {
                urgentCount++;
            }

            if (daysUntilRenewal <= upcomingDays && daysUntilRenewal >= 0) {
                upcomingCount++;
            }
        });

        return {
            totalUsers: this.users.length,
            urgentDeadlines: urgentCount,
            upcomingRenewals: upcomingCount
        };
    }

    // === EXPORT / IMPORT ===

    exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            users: this.users,
            deadlines: this.deadlines
        };
    }

    importData(data) {
        // Valider les données
        if (!data || typeof data !== 'object') {
            throw new Error('Données invalides');
        }

        // Vérifier que les données contiennent bien des usagers et des échéances
        if (!Array.isArray(data.users) || !Array.isArray(data.deadlines)) {
            throw new Error('Format de données invalide');
        }

        // Importer les données
        this.users = data.users;
        this.deadlines = data.deadlines;
        this.saveUsers();
        this.saveDeadlines();

        return {
            usersCount: this.users.length,
            deadlinesCount: this.deadlines.length
        };
    }
}

// ===== INTERFACE UTILISATEUR =====

class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentUserId = null;
        this.currentDeadlineId = null;
        this.currentView = 'grid'; // 'grid' ou 'timeline'
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.requestNotificationPermission();
        this.checkDeadlines();
        // Vérifier les échéances toutes les heures
        setInterval(() => this.checkDeadlines(), 3600000);
    }

    setupEventListeners() {
        // Bouton ajouter usager
        document.getElementById('addUserBtn').addEventListener('click', () => this.openUserModal());

        // Bouton exporter
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Bouton importer
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        // Input fichier d'import
        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Recherche
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderCurrentView();
        });

        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderCurrentView();
            });
        });

        // Sélecteur de vue
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.view-btn').classList.add('active');
                this.currentView = e.target.closest('.view-btn').dataset.view;
                this.switchView();
            });
        });

        // Formulaire usager
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Formulaire échéance
        document.getElementById('deadlineForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDeadline();
        });
    }

    render() {
        this.renderStats();
        this.renderCurrentView();
    }

    switchView() {
        const gridView = document.getElementById('gridView');
        const timelineView = document.getElementById('timelineView');

        if (this.currentView === 'grid') {
            gridView.style.display = 'block';
            timelineView.style.display = 'none';
            this.renderUserList();
        } else {
            gridView.style.display = 'none';
            timelineView.style.display = 'block';
            this.renderTimeline();
        }
    }

    renderCurrentView() {
        if (this.currentView === 'grid') {
            this.renderUserList();
        } else {
            this.renderTimeline();
        }
    }

    // === STATISTIQUES ===

    renderStats() {
        const stats = this.dataManager.getStats();
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('urgentDeadlines').textContent = stats.urgentDeadlines;
        document.getElementById('upcomingRenewals').textContent = stats.upcomingRenewals;
    }

    // === LISTE DES USAGERS ===

    renderUserList() {
        const userList = document.getElementById('userList');
        const emptyState = document.getElementById('emptyState');

        let users = this.dataManager.users;

        // Filtrer par recherche
        if (this.searchQuery) {
            users = users.filter(user =>
                user.name.toLowerCase().includes(this.searchQuery)
            );
        }

        // Filtrer par type
        if (this.currentFilter !== 'all') {
            users = users.filter(user => {
                const deadlines = this.dataManager.getDeadlinesByUser(user.id);
                const status = this.getUserStatus(deadlines);

                if (this.currentFilter === 'urgent') {
                    return status.hasUrgent;
                } else if (this.currentFilter === 'upcoming') {
                    return status.hasUpcoming;
                }
                return true;
            });
        }

        if (users.length === 0) {
            userList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        userList.innerHTML = users.map(user => this.renderUserCard(user)).join('');

        // Ajouter les événements click
        document.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openUserDetailsModal(card.dataset.userId);
            });
        });
    }

    renderUserCard(user) {
        const deadlines = this.dataManager.getDeadlinesByUser(user.id);
        const status = this.getUserStatus(deadlines);
        const initials = this.getInitials(user.name);

        let badges = '';
        if (status.hasUrgent) {
            badges += `
                <span class="badge badge-urgent">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    ${status.urgentCount} urgente(s)
                </span>
            `;
        }
        if (status.hasUpcoming) {
            badges += `
                <span class="badge badge-warning">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    ${status.upcomingCount} à renouveler
                </span>
            `;
        }
        if (!status.hasUrgent && !status.hasUpcoming && deadlines.length > 0) {
            badges += `
                <span class="badge badge-success">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    À jour
                </span>
            `;
        }

        return `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-card-header">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${this.escapeHtml(user.name)}</div>
                        <div class="user-deadlines-count">${deadlines.length} échéance(s)</div>
                    </div>
                </div>
                ${badges ? `<div class="user-card-badges">${badges}</div>` : ''}
            </div>
        `;
    }

    getUserStatus(deadlines) {
        const today = new Date();
        let urgentCount = 0;
        let upcomingCount = 0;

        deadlines.forEach(deadline => {
            const endDate = new Date(deadline.endDate);
            const renewalDate = new Date(deadline.renewalDate);
            const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
                urgentCount++;
            }
            if (daysUntilRenewal <= 30 && daysUntilRenewal >= 0) {
                upcomingCount++;
            }
        });

        return {
            hasUrgent: urgentCount > 0,
            hasUpcoming: upcomingCount > 0,
            urgentCount,
            upcomingCount
        };
    }

    // === VUE FRISE CHRONOLOGIQUE ===

    renderTimeline() {
        const timelineContainer = document.getElementById('timelineContainer');
        const emptyState = document.getElementById('timelineEmptyState');

        // Récupérer toutes les échéances
        let allEvents = [];

        this.dataManager.users.forEach(user => {
            const deadlines = this.dataManager.getDeadlinesByUser(user.id);

            deadlines.forEach(deadline => {
                // Ajouter l'événement de renouvellement
                allEvents.push({
                    type: 'renewal',
                    date: new Date(deadline.renewalDate),
                    deadline: deadline,
                    user: user
                });

                // Ajouter l'événement de fin
                allEvents.push({
                    type: 'end',
                    date: new Date(deadline.endDate),
                    deadline: deadline,
                    user: user
                });
            });
        });

        // Filtrer selon le filtre actuel
        if (this.currentFilter === 'urgent') {
            const today = new Date();
            allEvents = allEvents.filter(event => {
                const daysUntil = Math.ceil((event.date - today) / (1000 * 60 * 60 * 24));
                return event.type === 'end' && daysUntil <= 7 && daysUntil >= 0;
            });
        } else if (this.currentFilter === 'upcoming') {
            const today = new Date();
            allEvents = allEvents.filter(event => {
                const daysUntil = Math.ceil((event.date - today) / (1000 * 60 * 60 * 24));
                return event.type === 'renewal' && daysUntil <= 30 && daysUntil >= 0;
            });
        }

        // Filtrer par recherche
        if (this.searchQuery) {
            allEvents = allEvents.filter(event =>
                event.user.name.toLowerCase().includes(this.searchQuery)
            );
        }

        if (allEvents.length === 0) {
            timelineContainer.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Trier par date
        allEvents.sort((a, b) => a.date - b.date);

        // Grouper par mois
        const eventsByMonth = {};
        allEvents.forEach(event => {
            const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;
            if (!eventsByMonth[monthKey]) {
                eventsByMonth[monthKey] = [];
            }
            eventsByMonth[monthKey].push(event);
        });

        // Générer le HTML
        let html = '<div class="timeline-line"></div>';

        Object.keys(eventsByMonth).forEach((monthKey, index) => {
            const events = eventsByMonth[monthKey];
            const firstEvent = events[0];
            const monthName = firstEvent.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            html += `
                <div class="timeline-month-separator">
                    <div class="timeline-month-label">${monthName}</div>
                </div>
            `;

            events.forEach(event => {
                html += this.renderTimelineEvent(event);
            });
        });

        timelineContainer.innerHTML = html;

        // Ajouter les événements de clic
        timelineContainer.querySelectorAll('.timeline-event-content').forEach(elem => {
            elem.addEventListener('click', () => {
                const userId = elem.dataset.userId;
                this.openUserDetailsModal(userId);
            });
        });
    }

    renderTimelineEvent(event) {
        const today = new Date();
        const daysUntil = Math.ceil((event.date - today) / (1000 * 60 * 60 * 24));

        let statusClass = '';
        let markerClass = event.type;

        if (event.type === 'end' && daysUntil <= 7 && daysUntil >= 0) {
            statusClass = 'urgent';
            markerClass = 'urgent';
        } else if (event.type === 'renewal' && daysUntil <= 30 && daysUntil >= 0) {
            statusClass = 'warning';
        }

        const typeLabel = event.type === 'renewal' ? 'Renouvellement' : 'Échéance';
        const dateStr = this.formatDate(event.deadline[event.type === 'renewal' ? 'renewalDate' : 'endDate']);

        let daysInfo = '';
        if (daysUntil >= 0) {
            daysInfo = `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
        } else {
            daysInfo = `Passé depuis ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`;
        }

        return `
            <div class="timeline-event">
                <div class="timeline-event-marker ${markerClass}"></div>
                <div class="timeline-event-content ${statusClass}" data-user-id="${event.user.id}">
                    <div class="timeline-event-header">
                        <div>
                            <div class="timeline-event-user">${this.escapeHtml(event.user.name)}</div>
                            <div class="timeline-event-title">${this.escapeHtml(event.deadline.title)}</div>
                        </div>
                        <span class="timeline-event-type ${event.type}">${typeLabel}</span>
                    </div>
                    ${event.deadline.description ? `<div class="timeline-event-description">${this.escapeHtml(event.deadline.description)}</div>` : ''}
                    <div class="timeline-event-footer">
                        <span class="timeline-event-date">${dateStr}</span>
                        <span style="font-size: 13px; color: var(--text-secondary);">${daysInfo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // === MODAL USAGER ===

    openUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');

        form.reset();

        if (userId) {
            const user = this.dataManager.getUser(userId);
            if (user) {
                title.textContent = 'Modifier l\'usager';
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.name;
                document.getElementById('userNotes').value = user.notes || '';
            }
        } else {
            title.textContent = 'Nouvel Usager';
            document.getElementById('userId').value = '';
        }

        modal.classList.add('active');
    }

    saveUser() {
        const userId = document.getElementById('userId').value;
        const userData = {
            name: document.getElementById('userName').value.trim(),
            notes: document.getElementById('userNotes').value.trim()
        };

        if (!userData.name) {
            this.showNotification('Erreur', 'Le nom est obligatoire', 'danger');
            return;
        }

        if (userId) {
            this.dataManager.updateUser(userId, userData);
            this.showNotification('Succès', 'Usager modifié avec succès', 'success');
        } else {
            this.dataManager.addUser(userData);
            this.showNotification('Succès', 'Usager ajouté avec succès', 'success');
        }

        closeModal('userModal');
        this.render();
    }

    // === MODAL DÉTAILS USAGER ===

    openUserDetailsModal(userId) {
        this.currentUserId = userId;
        const user = this.dataManager.getUser(userId);
        if (!user) return;

        const modal = document.getElementById('userDetailsModal');
        document.getElementById('userDetailsName').textContent = user.name;

        const deadlines = this.dataManager.getDeadlinesByUser(userId);
        document.getElementById('userDetailsInfo').textContent = `${deadlines.length} échéance(s)`;

        // Événements des boutons
        document.getElementById('addDeadlineBtn').onclick = () => this.openDeadlineModal(userId);
        document.getElementById('editUserBtn').onclick = () => {
            closeModal('userDetailsModal');
            this.openUserModal(userId);
        };
        document.getElementById('deleteUserBtn').onclick = () => this.deleteUser(userId);

        this.renderDeadlinesList(userId);
        modal.classList.add('active');
    }

    renderDeadlinesList(userId) {
        const deadlines = this.dataManager.getDeadlinesByUser(userId);
        const deadlinesList = document.getElementById('deadlinesList');
        const noDeadlines = document.getElementById('noDeadlines');

        if (deadlines.length === 0) {
            deadlinesList.innerHTML = '';
            noDeadlines.style.display = 'block';
            return;
        }

        noDeadlines.style.display = 'none';

        // Trier par date de fin
        deadlines.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        deadlinesList.innerHTML = deadlines.map(deadline => this.renderDeadlineItem(deadline)).join('');

        // Ajouter les événements
        deadlinesList.querySelectorAll('.deadline-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openDeadlineModal(userId, btn.dataset.deadlineId);
            });
        });

        deadlinesList.querySelectorAll('.deadline-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteDeadline(btn.dataset.deadlineId);
            });
        });
    }

    renderDeadlineItem(deadline) {
        const today = new Date();
        const endDate = new Date(deadline.endDate);
        const renewalDate = new Date(deadline.renewalDate);
        const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

        let statusClass = '';
        if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
            statusClass = 'urgent';
        } else if (daysUntilRenewal <= 30 && daysUntilRenewal >= 0) {
            statusClass = 'warning';
        }

        return `
            <div class="deadline-item ${statusClass}">
                <div class="deadline-header">
                    <div>
                        <div class="deadline-title">${this.escapeHtml(deadline.title)}</div>
                        ${deadline.description ? `<div class="deadline-description">${this.escapeHtml(deadline.description)}</div>` : ''}
                    </div>
                    <div class="deadline-actions">
                        <button class="icon-btn deadline-edit-btn" data-deadline-id="${deadline.id}" title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="icon-btn danger deadline-delete-btn" data-deadline-id="${deadline.id}" title="Supprimer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="deadline-dates">
                    <div class="deadline-date">
                        <div class="deadline-date-label">Début renouvellement</div>
                        <div class="deadline-date-value">${this.formatDate(deadline.renewalDate)}</div>
                        ${daysUntilRenewal >= 0 ? `<small style="color: var(--text-secondary);">Dans ${daysUntilRenewal} jour(s)</small>` : `<small style="color: var(--danger-color);">Passé</small>`}
                    </div>
                    <div class="deadline-date">
                        <div class="deadline-date-label">Date de fin</div>
                        <div class="deadline-date-value">${this.formatDate(deadline.endDate)}</div>
                        ${daysUntilEnd >= 0 ? `<small style="color: var(--text-secondary);">Dans ${daysUntilEnd} jour(s)</small>` : `<small style="color: var(--danger-color);">Expiré</small>`}
                    </div>
                </div>
            </div>
        `;
    }

    deleteUser(userId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet usager et toutes ses échéances ?')) {
            this.dataManager.deleteUser(userId);
            closeModal('userDetailsModal');
            this.render();
            this.showNotification('Succès', 'Usager supprimé avec succès', 'success');
        }
    }

    // === MODAL ÉCHÉANCE ===

    openDeadlineModal(userId, deadlineId = null) {
        const modal = document.getElementById('deadlineModal');
        const title = document.getElementById('deadlineModalTitle');
        const form = document.getElementById('deadlineForm');

        form.reset();
        document.getElementById('deadlineUserId').value = userId;

        if (deadlineId) {
            const deadline = this.dataManager.deadlines.find(d => d.id === deadlineId);
            if (deadline) {
                title.textContent = 'Modifier l\'échéance';
                document.getElementById('deadlineId').value = deadline.id;
                document.getElementById('deadlineTitle').value = deadline.title;
                document.getElementById('deadlineDescription').value = deadline.description || '';
                document.getElementById('deadlineRenewalDate').value = deadline.renewalDate;
                document.getElementById('deadlineEndDate').value = deadline.endDate;
                document.getElementById('deadlineNotificationDays').value = deadline.notificationDays;
            }
        } else {
            title.textContent = 'Nouvelle Échéance';
            document.getElementById('deadlineId').value = '';
            // Définir des dates par défaut
            const today = new Date();
            const renewal = new Date(today);
            renewal.setMonth(renewal.getMonth() + 10);
            const end = new Date(today);
            end.setFullYear(end.getFullYear() + 1);

            document.getElementById('deadlineRenewalDate').value = renewal.toISOString().split('T')[0];
            document.getElementById('deadlineEndDate').value = end.toISOString().split('T')[0];
        }

        modal.classList.add('active');
    }

    saveDeadline() {
        const deadlineId = document.getElementById('deadlineId').value;
        const deadlineData = {
            userId: document.getElementById('deadlineUserId').value,
            title: document.getElementById('deadlineTitle').value.trim(),
            description: document.getElementById('deadlineDescription').value.trim(),
            renewalDate: document.getElementById('deadlineRenewalDate').value,
            endDate: document.getElementById('deadlineEndDate').value,
            notificationDays: document.getElementById('deadlineNotificationDays').value
        };

        if (!deadlineData.title || !deadlineData.renewalDate || !deadlineData.endDate) {
            this.showNotification('Erreur', 'Veuillez remplir tous les champs obligatoires', 'danger');
            return;
        }

        // Vérifier que la date de renouvellement est avant la date de fin
        if (new Date(deadlineData.renewalDate) > new Date(deadlineData.endDate)) {
            this.showNotification('Erreur', 'La date de renouvellement doit être avant la date de fin', 'danger');
            return;
        }

        if (deadlineId) {
            this.dataManager.updateDeadline(deadlineId, deadlineData);
            this.showNotification('Succès', 'Échéance modifiée avec succès', 'success');
        } else {
            this.dataManager.addDeadline(deadlineData);
            this.showNotification('Succès', 'Échéance ajoutée avec succès', 'success');
        }

        closeModal('deadlineModal');
        this.render();
        if (this.currentUserId) {
            this.renderDeadlinesList(this.currentUserId);
        }
    }

    deleteDeadline(deadlineId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette échéance ?')) {
            this.dataManager.deleteDeadline(deadlineId);
            this.render();
            if (this.currentUserId) {
                this.renderDeadlinesList(this.currentUserId);
            }
            this.showNotification('Succès', 'Échéance supprimée avec succès', 'success');
        }
    }

    // === NOTIFICATIONS ===

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    checkDeadlines() {
        const today = new Date();
        const notifiedKey = 'notifiedDeadlines';
        const notified = JSON.parse(localStorage.getItem(notifiedKey) || '{}');
        const todayStr = today.toISOString().split('T')[0];

        this.dataManager.deadlines.forEach(deadline => {
            const endDate = new Date(deadline.endDate);
            const renewalDate = new Date(deadline.renewalDate);
            const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

            const notifyKey = `${deadline.id}-${todayStr}`;

            // Notification pour date de fin proche
            if (daysUntilEnd <= 7 && daysUntilEnd >= 0 && !notified[notifyKey + '-end']) {
                const user = this.dataManager.getUser(deadline.userId);
                this.sendBrowserNotification(
                    'Échéance urgente',
                    `${user.name} - ${deadline.title} expire dans ${daysUntilEnd} jour(s)`
                );
                notified[notifyKey + '-end'] = true;
            }

            // Notification pour renouvellement
            if (daysUntilRenewal <= deadline.notificationDays && daysUntilRenewal >= 0 && !notified[notifyKey + '-renewal']) {
                const user = this.dataManager.getUser(deadline.userId);
                this.sendBrowserNotification(
                    'Renouvellement à prévoir',
                    `${user.name} - ${deadline.title} à renouveler dans ${daysUntilRenewal} jour(s)`
                );
                notified[notifyKey + '-renewal'] = true;
            }
        });

        localStorage.setItem(notifiedKey, JSON.stringify(notified));
    }

    sendBrowserNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>'
            });
        }
        // Toujours afficher la notification dans l'interface
        this.showNotification(title, body, 'warning');
    }

    showNotification(title, message, type = 'success') {
        const notificationArea = document.getElementById('notificationArea');
        const id = Date.now();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(title)}</div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        notificationArea.appendChild(notification);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // === EXPORT / IMPORT ===

    exportData() {
        try {
            const data = this.dataManager.exportData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Créer un nom de fichier avec la date
            const date = new Date().toISOString().split('T')[0];
            const filename = `echeances-sauvegarde-${date}.json`;

            // Créer un lien de téléchargement et le cliquer
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification(
                'Export réussi',
                `Données exportées dans ${filename}`,
                'success'
            );
        } catch (error) {
            this.showNotification(
                'Erreur d\'export',
                'Impossible d\'exporter les données: ' + error.message,
                'danger'
            );
        }
    }

    importData(file) {
        if (!file) return;

        // Vérifier que c'est bien un fichier JSON
        if (!file.name.endsWith('.json')) {
            this.showNotification(
                'Erreur d\'import',
                'Le fichier doit être au format JSON',
                'danger'
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Demander confirmation avant d'écraser les données
                const confirmMessage = `Voulez-vous vraiment importer ces données ?\n\n` +
                    `Usagers à importer: ${data.users?.length || 0}\n` +
                    `Échéances à importer: ${data.deadlines?.length || 0}\n\n` +
                    `ATTENTION: Cela remplacera toutes vos données actuelles !`;

                if (!confirm(confirmMessage)) {
                    // Réinitialiser l'input file
                    document.getElementById('importFileInput').value = '';
                    return;
                }

                const result = this.dataManager.importData(data);

                this.showNotification(
                    'Import réussi',
                    `${result.usersCount} usager(s) et ${result.deadlinesCount} échéance(s) importé(s)`,
                    'success'
                );

                // Réinitialiser l'input file
                document.getElementById('importFileInput').value = '';

                // Rafraîchir l'interface
                this.render();

            } catch (error) {
                this.showNotification(
                    'Erreur d\'import',
                    'Impossible d\'importer les données: ' + error.message,
                    'danger'
                );
                // Réinitialiser l'input file
                document.getElementById('importFileInput').value = '';
            }
        };

        reader.onerror = () => {
            this.showNotification(
                'Erreur de lecture',
                'Impossible de lire le fichier',
                'danger'
            );
            // Réinitialiser l'input file
            document.getElementById('importFileInput').value = '';
        };

        reader.readAsText(file);
    }

    // === UTILITAIRES ===

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== FONCTIONS GLOBALES =====

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Fermer les modales en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ===== INITIALISATION =====

let dataManager;
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    dataManager = new DataManager();
    uiManager = new UIManager(dataManager);
});
