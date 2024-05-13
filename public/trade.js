$(document).ready(function() {
    let notificationCount = 0;
    let isAdmin = true;

    // Notification modal elements
    const $notificationModal = $('#notificationModal');
    const $notificationList = $('#notificationList');
    const $notificationCount = $('.notification-count');

    $('#banCaForm').submit(function(event) {
        event.preventDefault();
        createTradeRequest('banCa');
    });

    $('#muaCaForm').submit(function(event) {
        event.preventDefault();
        createTradeRequest('muaCa');
    });

    $('.notification-icon').click(function() {
        $notificationModal.show();
        resetNotificationCount();
    });

    $('.close').click(function() {
        $notificationModal.hide();
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
                addNotification(`Yêu cầu ${requestData.type} của ${requestData.name} đã được tạo.`);
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
                const $approveButton = $('<button>').text('Chấp Thuận').addClass('btn').click(function() {
                    approveTradeRequest(request._id);
                });
                const $rejectButton = $('<button>').text('Từ Chối').addClass('btn delete-btn').click(function() {
                    rejectTradeRequest(request._id);
                });
                const $removeButton = $('<button>').text('Xóa').addClass('btn delete-btn').click(function() {
                    removeTradeRequest(request._id);
                });
                $actionsCell.append($approveButton).append($rejectButton).append($removeButton);
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
                alert('Yêu cầu đã được chấp thuận!');
                fetchTradeRequests();
                addNotification(`Yêu cầu ${data.trade.type} của ${data.trade.name} đã được chấp thuận.`);
            },
            error: function(error) {
                console.error('Lỗi khi chấp thuận yêu cầu:', error);
            }
        });
    }

    function rejectTradeRequest(requestId) {
        $.ajax({
            url: `/api/trades/${requestId}/reject`,
            method: 'PUT',
            success: function(data) {
                alert('Yêu cầu đã bị từ chối!');
                fetchTradeRequests();
                addNotification(`Yêu cầu ${data.trade.type} của ${data.trade.name} đã bị từ chối.`);
            },
            error: function(error) {
                console.error('Lỗi khi từ chối yêu cầu:', error);
            }
        });
    }

    function removeTradeRequest(requestId) {
        $.ajax({
            url: `/api/trades/${requestId}`,
            method: 'DELETE',
            success: function(data) {
                alert('Yêu cầu đã bị xóa!');
                fetchTradeRequests();
                addNotification(`Yêu cầu của ${data.trade.name} đã bị xóa.`);
            },
            error: function(error) {
                console.error('Lỗi khi xóa yêu cầu:', error);
            }
        });
    }

    function addNotification(message) {
        notificationCount++;
        $notificationCount.text(notificationCount);
        const $notificationItem = $('<li>').text(message);
        $notificationList.append($notificationItem);
    }

    function resetNotificationCount() {
        notificationCount = 0;
        $notificationCount.text(notificationCount);
    }

    // Initial fetch of trade requests
    fetchTradeRequests();
});
