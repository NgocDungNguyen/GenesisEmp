$(document).ready(function() {
    let isAdminLoggedIn = true; // Set to true for testing purposes
    let selectedWeek = getWeekNumber();
    let selectedRoom = $('#roomSelect').val();
    let selectedDay = $('#daySelect').val();

    populateWeekOptions();
    $('#weekSelect').val(selectedWeek);
    fetchRoomData(selectedWeek, selectedRoom, selectedDay);

    $('#weekSelect, #roomSelect, #daySelect').change(function() {
        selectedWeek = $('#weekSelect').val();
        selectedRoom = $('#roomSelect').val();
        selectedDay = $('#daySelect').val();
        fetchRoomData(selectedWeek, selectedRoom, selectedDay);
    });

    $('#sortSelect').change(function() {
        const sortBy = $(this).val();
        sortTable(sortBy);
    });

    function populateWeekOptions() {
        const currentWeek = getWeekNumber();
        for (let i = 1; i <= currentWeek; i++) {
            const dateRange = getDateRangeOfWeek(i);
            $('#weekSelect').append(`<option value="${i}">Week ${i} (${dateRange})</option>`);
        }
    }

    $('#addFurnitureForm').submit(function(event) {
        event.preventDefault();
        const furnitureName = $('#furnitureName').val();
        const room = $('#roomSelect').val();
        const week = $('#weekSelect').val();
        const day = $('#daySelect').val();

        $.ajax({
            type: 'POST',
            url: '/api/rooms',
            data: JSON.stringify({ room, furnitureName, week, day }),
            contentType: 'application/json',
            success: function(data) {
                alert('Thêm đồ đạc thành công');
                fetchRoomData(week, room, day);
                $('#furnitureName').val('');
            },
            error: function(error) {
                console.error('Lỗi khi thêm đồ đạc:', error);
            }
        });
    });

    function fetchRoomData(week, room, day) {
        console.log(`Fetching data for week ${week}, room ${room}, day ${day}`);
        $.ajax({
            url: `/api/rooms/${week}/${room}/${day}`,
            method: 'GET',
            success: function(data) {
                console.log(`Data for week ${week}, room ${room}, day ${day}:`, data);
                renderRoomTable(data);
            },
            error: function(error) {
                console.error('Lỗi khi lấy dữ liệu phòng:', error);
            }
        });
    }

    function renderRoomTable(data) {
        const $tableBody = $('#statusTable tbody');
        $tableBody.empty();
    
        if (data.length > 0) {
            data.forEach(function(item) {
                const $row = $('<tr>').toggleClass('highlight', item.priority).data('itemId', item._id);
    
                const $statusSelect = $('<select>')
                    .append('<option value="Tốt">Tốt</option>')
                    .append('<option value="Cần sửa">Cần sửa</option>')
                    .append('<option value="Cần thay thế">Cần thay thế</option>')
                    .append('<option value="Cần vệ sinh">Cần vệ sinh</option>')
                    .val(item.status)
                    .change(function() {
                        updateItemStatus(item._id, $statusSelect.val(), $noteInput.val(), $completeCheckbox.is(':checked'));
                    });
    
                const $noteInput = $('<input type="text">').val(item.note).change(function() {
                    updateItemStatus(item._id, $statusSelect.val(), $noteInput.val(), $completeCheckbox.is(':checked'));
                });
    
                const $completeCheckbox = $('<input type="checkbox">')
                    .prop('checked', item.completed)
                    .change(function() {
                        updateItemStatus(item._id, $statusSelect.val(), $noteInput.val(), $(this).is(':checked'));
                    });
    
                const $priorityButton = $('<button class="btn">Ưu tiên</button>').click(function() {
                    togglePriority(item._id);
                });
    
                const $deleteButton = $('<button class="btn">Xóa</button>').click(function() {
                    deleteItem(item._id);
                });
    
                $row.append($('<td>').text(item.furnitureName))
                    .append($('<td>').append($statusSelect))
                    .append($('<td>').append($noteInput))
                    .append($('<td>').append($completeCheckbox))
                    .append($('<td>').append($priorityButton).append($deleteButton));
    
                $tableBody.append($row);
            });
    
            // Make the table rows sortable
            $tableBody.sortable({
                stop: function(event, ui) {
                    updateItemOrder();
                }
            });
        } else {
            $tableBody.append('<tr><td colspan="5">Không có dữ liệu cho tuần và phòng này.</td></tr>');
        }
    }
    
    // Function to update the order of items after sorting
    function updateItemOrder() {
        const order = [];
        $('#statusTable tbody tr').each(function(index, row) {
            const itemId = $(row).data('itemId');
            order.push({ _id: itemId, order: index });
        });
    
        $.ajax({
            url: '/api/rooms/updateOrder',
            method: 'POST',
            data: JSON.stringify({ order }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Cập nhật thứ tự thành công:', data);
            },
            error: function(error) {
                console.error('Lỗi khi cập nhật thứ tự:', error);
            }
        });
    }
    

    function updateItemStatus(id, status, note, completed) {
        $.ajax({
            url: `/api/rooms/${id}`,
            method: 'PUT',
            data: JSON.stringify({ status, note, completed }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Cập nhật trạng thái thành công:', data);
            },
            error: function(error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
            }
        });
    }

    function deleteItem(id) {
        $.ajax({
            url: `/api/rooms/${id}`,
            method: 'DELETE',
            success: function(data) {
                console.log('Đã xóa thành công:', data);
                fetchRoomData(selectedWeek, selectedRoom, selectedDay);
            },
            error: function(error) {
                console.error('Lỗi khi xóa mục:', error);
            }
        });
    }

    function togglePriority(id) {
        $.ajax({
            url: `/api/rooms/${id}/priority`,
            method: 'PATCH',
            success: function(data) {
                console.log('Đã thay đổi ưu tiên thành công:', data);
                fetchRoomData(selectedWeek, selectedRoom, selectedDay);
            },
            error: function(error) {
                console.error('Lỗi khi thay đổi ưu tiên:', error);
            }
        });
    }

    function sortTable(sortBy) {
        const rows = $('#statusTable tbody tr').get();
        rows.sort((a, b) => {
            let valA, valB;

            if (sortBy === 'furnitureName') {
                valA = $(a).find('td').eq(0).text().toUpperCase();
                valB = $(b).find('td').eq(0).text().toUpperCase();
            } else if (sortBy === 'furnitureNameDesc') {
                valA = $(a).find('td').eq(0).text().toUpperCase();
                valB = $(b).find('td').eq(0).text().toUpperCase();
                [valA, valB] = [valB, valA];
            } else if (sortBy === 'condition') {
                valA = $(a).find('td').eq(1).find('select').val();
                valB = $(b).find('td').eq(1).find('select').val();
                valA = valA === 'Tốt' ? 1 : 2;
                valB = valB === 'Tốt' ? 1 : 2;
            } else if (sortBy === 'complete') {
                valA = $(a).find('td').eq(3).find('input').is(':checked') ? 1 : 0;
                valB = $(b).find('td').eq(3).find('input').is(':checked') ? 1 : 0;
            }

            if (valA < valB) {
                return -1;
            }
            if (valA > valB) {
                return 1;
            }
            return 0;
        });

        $.each(rows, (index, row) => {
            $('#statusTable tbody').append(row);
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
});
