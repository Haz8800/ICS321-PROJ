document.querySelectorAll('nav ul li button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('nav ul li button').forEach(button => {
            button.classList.remove('active');
        });
        this.classList.add('active');
        showSection(this.getAttribute('onclick').split("'")[1]);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function logout() {
    console.log('Logging out...');
    window.location.href = 'mainpage.html'; 
}
