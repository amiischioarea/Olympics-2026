const API_BASE = 'http://localhost:3000/api';

$(document).ready(function() {
    //  spalsh screen 
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

//pt schimbarea temei
const savedTheme = localStorage.getItem('theme') || 'light';

// tema schimbata la aplicare
if (savedTheme === 'dark') {
    $('body').addClass('dark-theme');
}
$('#theme-select').val(savedTheme);

//schimbarea selectiei
$('#theme-select').change(function() {
    const selectedTheme = $(this).val();
    
    if (selectedTheme === 'dark') {
        $('body').addClass('dark-theme');
    } else {
        $('body').removeClass('dark-theme');
    }
    
    // Salvăm în browser
    localStorage.setItem('theme', selectedTheme);
});

    // initializare date
    loadData();
    populateSportFilter();

    // verificam daca au date salvate anterior
    const savedSearch = localStorage.getItem('lastSearch');
    if (savedSearch) {
        $('#searchInput').val(savedSearch);
        $.get(`${API_BASE}/athletes/search?name=${savedSearch}`, function(data) {
            renderAthletesTable(data);
        });
    }

    // add sportiv
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
            error: function(err) { alert("Eroare la înregistrare: " + err.responseJSON.error); }
        });
    });

    // search sportiv
    $('#btnSearch').click(function() {
        const query = $('#searchInput').val();
        localStorage.setItem('lastSearch', query);
        if (!query) return loadData();
        $.get(`${API_BASE}/athletes/search?name=${query}`, function(data) {
            renderAthletesTable(data);
        });
    });

    // reset
    $('#btnResetSearch').click(function() {
        $('#searchInput').val('');
        $('#filterSport').val('all');
        localStorage.removeItem('lastSearch');
        loadData();
    });

    // filtrare
    $('#filterSport').change(function() {
        const selectedSport = $(this).val().toLowerCase();
        $("#athletesTable tbody tr").filter(function() {
            const rowSport = $(this).find("td:eq(4)").text().toLowerCase();
            $(this).toggle(selectedSport === "all" || rowSport === selectedSport);
        });
    });

    // acordare medalie
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
            error: function() { alert("ID Sportiv invalid sau medalie deja existentă!"); }
        });
    });

    // logica editare - butoane edit / cancel
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

function loadMedalRankings() {
    $.get(`${API_BASE}/medals_country`, function(data) {
        console.log("recived data:", data); //pt debug
        
        if (data.length === 0) {
            $('#rankingsTable tbody').html('<tr><td colspan="6" style="text-align:center;">No medals awarded yet.</td></tr>');
            return;
        }

        const rows = data.map((row, index) => `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${row.country}</td>
                <td>${row.gold}</td>
                <td>${row.silver}</td>
                <td>${row.bronze}</td>
                <td><strong>${row.total}</strong></td>
            </tr>
        `);
        $('#rankingsTable tbody').html(rows.join(''));
    });
}

function loadData() {
    // populeaza dropdown urile
    $.get(`${API_BASE}/countries`, function(countries) {
        $('#countryId').html(countries.map(c => `<option value="${c.country_id}">${c.name}</option>`).join(''));
    });
    
    $.get(`${API_BASE}/sports`, function(sports) {
        $('#sportId').html(sports.map(s => `<option value="${s.sport_id}">${s.name}</option>`).join(''));
    });

    // incarca tabelele
    $.get(`${API_BASE}/athletes`, function(data) { 
        renderAthletesTable(data); 
    });

    $.get(`${API_BASE}/medals`, function(data) {
        const rows = data.map(m => `
            <tr>
                <td><span class="medal-${m.medal_type.toLowerCase()}">${m.medal_type}</span></td>
                <td>${m.first_name} ${m.last_name}</td>
                <td>${m.sport}</td>
            </tr>
        `);
        $('#medalsTable tbody').html(rows.join(''));
    });

    loadMedalRankings();
}

function populateSportFilter() {
    $.get(`${API_BASE}/sports`, function(sports) {
        // pastram prima optiune si eliminam restul
        let options = sports.map(s => `<option value="${s.name}">${s.name}</option>`);
        $('#filterSport').find('option:not(:first)').remove(); // pt eliminarea duplicatelor
        $('#filterSport').append(options.join(''));
    });
}

function renderAthletesTable(data) {
    const rows = data.map(a => `
        <tr>
            <td><strong>${a.athlete_id}</strong></td>
            <td>${a.first_name}</td>
            <td>${a.last_name}</td>
            <td>${a.country}</td>
            <td>${a.sport}</td>
            <td>
                <button class="edit-btn" onclick="editAthlete(${a.athlete_id}, '${a.first_name}', '${a.last_name}')">Edit</button>
                <button class="delete-btn" onclick="deleteAthlete(${a.athlete_id})">Delete</button>
            </td>
        </tr>
    `);
    $('#athletesTable tbody').html(rows.join(''));
}

function deleteAthlete(id) {
    if (confirm("Sigur ștergi sportivul? Toate medaliile lui vor fi eliminate!")) {
        $.ajax({ 
            url: `${API_BASE}/athletes/${id}`, 
            type: 'DELETE', 
            success: function() { loadData(); } 
        });
    }
}

function editAthlete(id, firstName, lastName) {
    $('#form-atlet, #form-medalie, #lista-atleti, #lista-medalii').fadeOut(300, function() {
        $('#edit-athlete-id').val(id);
        $('#edit-fName').val(firstName);
        $('#edit-lName').val(lastName);
        $('#edit-section').fadeIn();
    });
}