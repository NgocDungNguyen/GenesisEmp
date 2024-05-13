$(document).ready(function() {
    let isAdmin = false; // Update this variable based on the logged-in user's role
    let notificationCount = 0;

    $('#banCaForm').submit(function(event) {
        event.preventDefault();
        createTradeRequest('banCa');
    });

    $('#muaCaForm').submit(function(event) {
        event.preventDefault();
        createTradeRequest('muaCa');
    });

    function createTradeRequest(type) {
        const name = $(`#${type}Name`).val();
        const shift = $(`#${type}Shift`).val();
        const note = $(`#${type}Note`).val();

        const requestData = {
            type: type === 'banCa' ? 'Bán Ca' : 'Mua Ca',
            name,
            shift,
            note
        };

        $.ajax({
            url: '/api/trades',
            method: 'POST',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function(data) {
                alert('Yêu cầu đã được tạo thành công!');
                fetchTradeRequests();
                increaseNotificationCount();
            },
            error: function(error) {
                console.error('Lỗi khi tạo yêu cầu:', error);
            }
        });
    }

    function fetchTradeRequests() {
        $.ajax({
            url: '/api/trades',
            method: 'GET',
            success: function(data) {
                renderTradeRequests(data);
            },
            error: function(error) {
                console.error('Lỗi khi lấy yêu cầu:', error);
            }
        });
    }

    function renderTradeRequests(data) {
        const $tableBody = $('#tradeRequestsTable tbody');
        $tableBody.empty();

        data.forEach(function(request) {
            const $row = $('<tr>');
            $row.append($('<td>').text(request.name));
            $row.append($('<td>').text(request.type));
            $row.append($('<td>').text(request.shift));
            $row.append($('<td>').text(request.note));

            const $actionsCell = $('<td>');
            if (isAdmin) {
                const $approveButton = $('<button>').text('Duyệt').addClass('btn').click(function() {
                    approveTradeRequest(request._id);
                });
                const $rejectButton = $('<button>').text('Hủy').addClass('btn delete-btn').click(function() {
                    rejectTradeRequest(request._id);
                });
                $actionsCell.append($approveButton).append($rejectButton);
            }
            $row.append($actionsCell);
            $tableBody.append($row);
        });
    }

    function approveTradeRequest(requestId) {
        $.ajax({
            url: `/api/trades/${requestId}/approve`,
            method: 'PUT',
            success: function(data) {
                alert('Yêu cầu đã được duyệt thành công!');
                fetchTradeRequests();
                increaseNotificationCount();
            },
            error: function(error) {
                console.error('Lỗi khi duyệt yêu cầu:', error);
            }
        });
    }

    function rejectTradeRequest(requestId) {
        $.ajax({
            url: `/api/trades/${requestId}`,
            method: 'DELETE',
            success: function(data) {
                alert('Yêu cầu đã bị hủy!');
                fetchTradeRequests();
                increaseNotificationCount();
            },
            error: function(error) {
                console.error('Lỗi khi hủy yêu cầu:', error);
            }
        });
    }

    function increaseNotificationCount() {
        notificationCount++;
        $('.notification-count').text(notificationCount);
    }

    // Initial fetch of trade requests
    fetchTradeRequests();
});
