const serverInput = document.getElementById('serverInput');
const sendButton = document.getElementById('sendButton');
const memberCounter = document.getElementById('memberCounter');

let intervalId;

sendButton.addEventListener('click', () => {
    const inputValue = serverInput.value.trim();
    const inviteCode = extractInviteCode(inputValue);
    if (inviteCode) {
        fetchServerData(inviteCode);
    } else {
        showError('Invalid invite URL or code');
    }
});

function extractInviteCode(input) {
    const urlPattern = /^https?:\/\/(www\.)?discord\.(gg|com\/invite)\/(\w+)/;
    const match = input.match(urlPattern);
    return match ? match[3] : input;
}

function fetchServerData(inviteCode) {
    const apiUrl = `https://discord.com/api/v9/invites/${encodeURIComponent(inviteCode)}?with_counts=true`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.guild) {
                updateMemberCounter(data);
                startUpdateInterval(inviteCode);
            } else {
                showError('Invalid invite code');
            }
        })
        .catch(error => {
            showError('Error fetching server data');
            console.error('Error:', error);
        });
}

function updateMemberCounter(serverData) {
    const totalMembers = serverData.approximate_member_count;
    const onlineMembers = serverData.approximate_presence_count;
    memberCounter.textContent = `Members: ${totalMembers} (${onlineMembers} online)`;
    memberCounter.classList.remove('hidden');
}

function startUpdateInterval(inviteCode) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        fetchServerData(inviteCode);
    }, 30000); // Update every 30 seconds
}

function showError(message) {
    memberCounter.textContent = message;
    memberCounter.classList.remove('hidden');
}