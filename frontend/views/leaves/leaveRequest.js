document.addEventListener('DOMContentLoaded', async function () {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('You must log in first!');
        window.location.href = 'login.html';
        return;
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Welcome, ${loggedInUser.firstName} ${loggedInUser.lastName}`;

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        alert('You have been logged out.');
        window.location.href = 'login.html';
    });

    const leaveRequestForm = document.getElementById('leaveRequestForm');
    const leaveRequestsList = document.getElementById('leaveRequests');

    leaveRequestForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const reason = document.getElementById('reason').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const numOfDays = document.getElementById('numOfDays').value;
        const applicationDate = document.getElementById('applicationDate').value;

        if (new Date(applicationDate) >= new Date(dateFrom)) {
            alert('Application date must be earlier than the leave start date.');
            return;
        }

        const newLeaveRequest = {
            employeeId: loggedInUser.employeeId,
            reason,
            dateFrom,
            numOfDays,
            applicationDate,
            status: 'Pending'
        };

        try {
            const response = await fetch('http://localhost:3000/leaveRequests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLeaveRequest)
            });

            if (response.ok) {
                alert('Leave request submitted successfully!');
                leaveRequestForm.reset();
                loadLeaveRequests(loggedInUser.employeeId);
            } else {
                alert('Failed to submit leave request.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the leave request.');
        }
    });

    async function loadLeaveRequests(employeeId) {
        try {
            const response = await fetch(`http://localhost:3000/leaveRequests?employeeId=${employeeId}`);
            const leaveRequests = await response.json();

            leaveRequestsList.innerHTML = '';
            leaveRequests.forEach(request => {
                const li = document.createElement('div');
                li.className = 'leave-item';
                li.innerHTML = `
                            <div class="leave-item-header">
                                <span class="leave-reason">${request.reason}</span>
                                <span class="leave-status status-${request.status.toLowerCase()}">${request.status}</span>
                            </div>
                            <div class="leave-details">
                                <div class="detail-item">
                                    <span class="detail-label">Start Date</span>
                                    <span class="detail-value">${new Date(request.dateFrom).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration</span>
                                    <span class="detail-value">${request.numOfDays} days</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Applied On</span>
                                    <span class="detail-value">${new Date(request.applicationDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `;
                leaveRequestsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    loadLeaveRequests(loggedInUser.employeeId);
});
   