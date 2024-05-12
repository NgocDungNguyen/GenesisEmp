$(document).ready(function() {
    let selectedWeek = getWeekNumber();
    let selectedRoom = $('#roomSelect').val();
    let selectedDay = $('#daySelect').val();

    populateWeekOptions();
    $('#weekSelect').val(selectedWeek);
    fetchBackupData(selectedWeek, selectedRoom, selectedDay);

    $('#weekSelect, #roomSelect, #daySelect').change(function() {
        selectedWeek = $('#weekSelect').val();
        selectedRoom = $('#roomSelect').val();
        selectedDay = $('#daySelect').val();
        fetchBackupData(selectedWeek, selectedRoom, selectedDay);
    });

    $('#addBackupForm').submit(function(event) {
        event.preventDefault();
        const itemName = $('#itemName').val();
        const quantity = parseInt($('#quantity').val(), 10);
        const note = $('#note').val();
        const room = $('#roomSelect').val();
        const week = parseInt($('#weekSelect').val(), 10);
        const day = $('#daySelect').val();

        $.ajax({
            type: 'POST',
            url: '/api/backup',
            data: JSON.stringify({ room, itemName, quantity, week, day, note }),
            contentType: 'application/json',
            success: function(data) {
                alert('Thêm đồ vào kho thành công');
                fetchBackupData(week, room, day);
                $('#itemName').val('');
                $('#quantity').val('');
                $('#note').val('');
            },
            error: function(error) {
                console.error('Lỗi khi thêm đồ vào kho:', error.responseJSON.message || error);
            }
        });
    });

    function fetchBackupData(week, room, day) {
        console.log(`Fetching data for week ${week}, room ${room}, day ${day}`);
        $.ajax({
            url: `/api/backup/${week}/${room}/${day}`,
            method: 'GET',
            success: function(data) {
                console.log(`Data for week ${week}, room ${room}, day ${day}:`, data);
                renderBackupTable(data);
            },
            error: function(error) {
                console.error('Lỗi khi lấy dữ liệu kho:', error);
            }
        });
    }

    function renderBackupTable(data) {
        const $tableBody = $('#backupTable tbody');
        $tableBody.empty();

        if (data.length > 0) {
            data.forEach(function(item) {
                const $row = $('<tr>').data('itemId', item._id);

                const $historyButton = $('<button class="btn">Lịch Sử</button>').click(function() {
                    showHistoryModal(item.history);
                });

                const $takeItemButton = $('<button class="btn">Rút đồ</button>').click(function() {
                    const takeAmount = prompt('Nhập số lượng rút:');
                    const takeNote = prompt('Nhập ghi chú:');
                    if (takeAmount && takeNote) {
                        takeItem(item._id, takeAmount, takeNote);
                    }
                });

                const $deleteButton = $('<button class="btn">Xóa</button>').click(function() {
                    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
                        deleteItem(item._id);
                    }
                });

                $row.append($('<td>').text(item.itemName))
                    .append($('<td>').text(item.quantity))
                    .append($('<td>').text(item.note))
                    .append($('<td>').append($historyButton))
                    .append($('<td>').append($takeItemButton).append($deleteButton));

                $tableBody.append($row);
            });
        } else {
            $tableBody.append('<tr><td colspan="5">Không có dữ liệu cho tuần, ngày và phòng này.</td></tr>');
        }
    }

    function updateItemStatus(id, note, quantity) {
        $.ajax({
            url: `/api/backup/${id}`,
            method: 'PUT',
            data: JSON.stringify({ note, quantity }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Cập nhật trạng thái thành công:', data);
                syncBackupData(id, quantity, note);  // Sync quantity across all days and add to history
            },
            error: function(error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
            }
        });
    }

    function syncBackupData(id, quantity, note) {
        $.ajax({
            url: `/api/backup/sync/${id}`,
            method: 'POST',
            data: JSON.stringify({ quantity, note }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Đồng bộ dữ liệu thành công:', data);
                fetchBackupData(selectedWeek, selectedRoom, selectedDay);
            },
            error: function(error) {
                console.error('Lỗi khi đồng bộ dữ liệu:', error);
            }
        });
    }

    function takeItem(id, amount, note) {
        $.ajax({
            url: `/api/backup/take/${id}`,
            method: 'POST',
            data: JSON.stringify({ amount, note }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Rút đồ thành công:', data);
                fetchBackupData(selectedWeek, selectedRoom, selectedDay);
            },
            error: function(error) {
                console.error('Lỗi khi rút đồ:', error);
            }
        });
    }

    function showHistoryModal(history) {
        const $modal = $('#historyModal');
        const $historyContent = $('#historyContent');
        $historyContent.empty();

        if (history.length > 0) {
            history.forEach(function(entry) {
                $historyContent.append(`<p>${entry}</p>`);
            });
        } else {
            $historyContent.append('<p>Không có lịch sử</p>');
        }

        $modal.show();
    }

    $('.close').click(function() {
        $('#historyModal').hide();
    });

    function deleteItem(id) {
        $.ajax({
            url: `/api/backup/${id}`,
            method: 'DELETE',
            success: function(data) {
                console.log('Đã xóa thành công:', data);
                fetchBackupData(selectedWeek, selectedRoom, selectedDay);
            },
            error: function(error) {
                console.error('Lỗi khi xóa mục:', error);
            }
        });
    }

    function getWeekNumber() {
        const today = new Date();
        const onejan = new Date(today.getFullYear(), 0, 1);
        const millisecsInDay = 86400000;
        const weekNumber = Math.ceil((((today.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
        console.log("Current week:", weekNumber);
        return weekNumber;
    }

    function getDateRangeOfWeek(weekNo) {
        const d1 = new Date(new Date().getFullYear(), 0, 1);
        const numOfdaysPastSinceLastMonday = d1.getDay() - 1;
        d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
        d1.setDate(d1.getDate() + (7 * (weekNo - 1)));
        const rangeIsFrom = (d1.getMonth() + 1) + "/" + d1.getDate();
        const d2 = new Date(d1);
        d2.setDate(d1.getDate() + 6);
        const rangeIsTo = (d2.getMonth() + 1) + "/" + d2.getDate();
        return rangeIsFrom + "-" + rangeIsTo;
    }

    function populateWeekOptions() {
        const currentWeek = getWeekNumber();
        for (let i = 1; i <= currentWeek; i++) {
            const dateRange = getDateRangeOfWeek(i);
            $('#weekSelect').append(`<option value="${i}">Week ${i} (${dateRange})</option>`);
        }
    }
});
