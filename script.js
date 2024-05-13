const serverInput = document.getElementById('serverInput');
const sendButton = document.getElementById('sendButton');
const serverInfo = document.getElementById('serverInfo');
const serverName = document.getElementById('serverName');
const memberCounter = document.getElementById('memberCounter');
const onlineMemberCounter = document.getElementById('onlineMemberCounter');
const countdownTimer = document.getElementById('countdownTimer');
const themeSwitch = document.getElementById('themeSwitch');

let intervalId;
let countdownTimerId;
let remainingTime = 30000; // 30 seconds

sendButton.addEventListener('click', () => {
    const inputValue = serverInput.value.trim();
    const inviteCode = extractInviteCode(inputValue);
    if (inviteCode) {
        fetchServerData(inviteCode);
    } else {
        showError('Invalid invite URL or code');
    }
});

// Theme Switch
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light');
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
                updateServerInfo(data);
                startUpdateInterval(inviteCode);
                startCountdownTimer();
            } else {
                showError('Invalid invite code');
            }
        })
        .catch(error => {
            showError('Error fetching server data');
            console.error('Error:', error);
        });
}

function updateServerInfo(serverData) {
  const serverIconUrl = `https://cdn.discordapp.com/icons/${serverData.guild.id}/${serverData.guild.icon}`;
  const serverIcon = document.getElementById('serverIcon');
  serverIcon.src = serverIconUrl;

  serverName.textContent = serverData.guild.name;
  const totalMembers = serverData.approximate_member_count;
  const onlineMembers = serverData.approximate_presence_count;

  const prevTotalMembers = parseInt(memberCounter.textContent) || 0;
  const prevOnlineMembers = parseInt(onlineMemberCounter.textContent) || 0;

  if (totalMembers !== prevTotalMembers) {
    memberCounter.classList.remove('animate__animated', 'animate__flipInY');
    void memberCounter.offsetWidth; // Trigger a reflow
    memberCounter.classList.add('animate__animated', 'animate__flipInY');
    memberCounter.textContent = `${totalMembers}`;
  }

  if (onlineMembers !== prevOnlineMembers) {
    onlineMemberCounter.classList.remove('animate__animated', 'animate__flipInY');
    void onlineMemberCounter.offsetWidth; // Trigger a reflow
    onlineMemberCounter.classList.add('animate__animated', 'animate__flipInY');
    onlineMemberCounter.textContent = `${onlineMembers}`;
  }

  serverInfo.classList.remove('hidden');
}

function startUpdateInterval(inviteCode) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        fetchServerData(inviteCode);
    }, 30000); // Update every 30 seconds
}

function startCountdownTimer() {
    clearInterval(countdownTimerId);
    countdownTimerId = setInterval(updateCountdownTimer, 1000);
}

function updateCountdownTimer() {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    countdownTimer.textContent = `Next update in: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    remainingTime -= 1000;
    if (remainingTime <= 0) {
        remainingTime = 30000; // Reset to 30 seconds
        clearInterval(countdownTimerId);
    }
}

function showError(message) {
    serverInfo.classList.add('hidden');
    memberCounter.textContent = message;
    onlineMemberCounter.textContent = '';
    countdownTimer.textContent = '';
}