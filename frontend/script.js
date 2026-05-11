const API_BASE = 'http://localhost:3000/api';

$(document).ready(function() {
    // 1. SPLASH SCREEN
    if (!sessionStorage.getItem('splashShown')) {
        setTimeout(function() {
            $('#splash-screen').css('opacity', '0');
            setTimeout(function() {
                $('#splash-screen').hide();
                sessionStorage.setItem('splashShown', 'true');
            }, 1000); 
        }, 2000); 
    } else {
        $('#splash-screen').hide();
    }

    // 2. THEME SELECTOR
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        $('body').addClass('dark-theme');
    }
    $('#theme-select').val(savedTheme);

    $('#theme-select').change(function() {
        const selectedTheme = $(this).val();
        if (selectedTheme === 'dark') {
            $('body').addClass('dark-theme');
        } else {
            $('body').removeClass('dark-theme');
        }
        localStorage.setItem('theme', selectedTheme);
    });

    // 3. INITIAL LOAD
    loadData();
    populateSportFilter();
    initNewsDragScroll();

    // 4. SEARCH LOGIC
    const savedSearch = localStorage.getItem('lastSearch');
    if (savedSearch) {
        $('#searchInput').val(savedSearch);
        $.get(`${API_BASE}/athletes/search?name=${savedSearch}`, function(data) {
            renderAthletesTable(data);
        });
    }

    $('#btnSearch').click(function() {
        const query = $('#searchInput').val();
        localStorage.setItem('lastSearch', query);
        if (!query) return loadData();
        $.get(`${API_BASE}/athletes/search?name=${query}`, function(data) {
            renderAthletesTable(data);
        });
    });

    $('#btnResetSearch').click(function() {
        $('#searchInput').val('');
        $('#filterSport').val('all');
        localStorage.removeItem('lastSearch');
        loadData();
    });

    // 5. ATHLETE CRUD
    $('#btnAddAthlete').click(function() {
        const data = {
            first_name: $('#fName').val(),
            last_name: $('#lName').val(),
            country_id: parseInt($('#countryId').val()),
            sport_id: parseInt($('#sportId').val())
        };
        if(!data.first_name || !data.last_name) return alert("Completează numele!");

        $.ajax({
            url: `${API_BASE}/athletes`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() { 
                $('#fName, #lName').val('');
                loadData();
            },
            error: function(err) { alert("Eroare la înregistrare!"); }
        });
    });

    // 6. MEDALS
    $('#btnAwardMedal').click(function() {
        const data = {
            athlete_id: parseInt($('#athleteIdInput').val()),
            medal_type: $('#medalType').val(),
            event_id: 1 
        };
        $.ajax({
            url: `${API_BASE}/medals`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() { 
                $('#athleteIdInput').val('');
                loadData();
            },
            error: function() { alert("ID Sportiv invalid sau medalie existentă!"); }
        });
    });

    // 7. EDIT LOGIC
    $('#btnCancelEdit').click(function() {
        $('#edit-section').fadeOut(300, function() {
            $('#form-atlet, #form-medalie, #lista-atleti, #lista-medalii').fadeIn();
        });
    });

    $('#btnSaveEdit').click(function() {
        const id = $('#edit-athlete-id').val();
        const data = { 
            first_name: $('#edit-fName').val(), 
            last_name: $('#edit-lName').val() 
        };
        $.ajax({
            url: `${API_BASE}/athletes/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() {
                $('#edit-section').fadeOut(300, function() {
                    loadData();
                    $('#form-atlet, #form-medalie, #lista-atleti, #lista-medalii').fadeIn();
                });
            }
        });
    });
});

// --- FUNCTIONS ---

function loadData() {
    $.get(`${API_BASE}/countries`, (c) => $('#countryId').html(c.map(x => `<option value="${x.country_id}">${x.name}</option>`).join('')));
    $.get(`${API_BASE}/sports`, (s) => $('#sportId').html(s.map(x => `<option value="${x.sport_id}">${x.name}</option>`).join('')));
    $.get(`${API_BASE}/athletes`, (data) => renderAthletesTable(data));
    $.get(`${API_BASE}/medals`, (data) => {
        const rows = data.map(m => `<tr><td><span class="medal-${m.medal_type.toLowerCase()}">${m.medal_type}</span></td><td>${m.first_name} ${m.last_name}</td><td>${m.sport}</td></tr>`);
        $('#medalsTable tbody').html(rows.join(''));
    });
    loadMedalRankings();
    loadLatestNews(); 
}

function loadLatestNews() {
    $.get('http://localhost:3000/api/news', function(articles) {
        const newsHTML = articles.map(art => `
            <div class="article-card">
            <img src="${art.image}" alt="News">
            <div class="article-meta">2026 | ${art.category}</div>
            <h3>${art.title}</h3>
            <a href="${art.url}" target="_blank">Read Official Story ↗</a>
            </div>
`).join('');

$('#latestNewsContainer').html(newsHTML);
    });
}

$(document).ready(function() {
    loadLatestNews();
});

$(document).ready(function() {
    loadLatestNews();
});

function openFullArticle(id) {
    $.get(`${API_BASE}/news/${id}`, function(article) {
        $('#modal-title').text(article.title);
        $('#modal-body').html(`
            <img src="${article.image_url}" style="width:100%; border-radius:10px; margin-bottom:15px;">
            <p><strong>${article.date} | ${article.category}</strong></p>
            <div style="font-size:1.1rem; line-height:1.6;">${article.content}</div>
        `);
        $('#news-modal').fadeIn();
    });
}

function renderAthletesTable(data) {
    const rows = data.map(a => `
        <tr>
            <td><strong>${a.athlete_id}</strong></td>
            <td>${a.first_name}</td><td>${a.last_name}</td>
            <td>${a.country || 'N/A'}</td><td>${a.sport || 'N/A'}</td>
            <td>
                <button class="edit-btn" onclick="editAthlete(${a.athlete_id}, '${a.first_name}', '${a.last_name}')">Edit</button>
                <button class="delete-btn" onclick="deleteAthlete(${a.athlete_id})">Delete</button>
            </td>
        </tr>`);
    $('#athletesTable tbody').html(rows.join(''));
}

function deleteAthlete(id) {
    if (confirm("Ștergi sportivul?")) {
        $.ajax({ url: `${API_BASE}/athletes/${id}`, type: 'DELETE', success: () => loadData() });
    }
}

function editAthlete(id, f, l) {
    $('#form-atlet, #form-medalie, #lista-atleti, #lista-medalii').fadeOut(300, () => {
        $('#edit-athlete-id').val(id);
        $('#edit-fName').val(f);
        $('#edit-lName').val(l);
        $('#edit-section').fadeIn();
    });
}

function loadMedalRankings() {
    $.get(`${API_BASE}/medals_country`, (data) => {
        const rows = data.map((r, i) => `<tr><td>${i+1}</td><td>${r.country}</td><td>${r.gold}</td><td>${r.silver}</td><td>${r.bronze}</td><td>${r.total}</td></tr>`);
        $('#rankingsTable tbody').html(rows.join(''));
    });
}

function populateSportFilter() {
    $.get(`${API_BASE}/sports`, (sports) => {
        $('#filterSport').append(sports.map(s => `<option value="${s.name}">${s.name}</option>`).join(''));
    });
}

function initNewsDragScroll() {
    const slider = document.querySelector('.news-slider');
    if(!slider) return;
    let isDown = false, startX, scrollLeft;
    slider.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeft - (x - startX) * 2;
    });
}