$(document).ready(function() {
    let isAdminLoggedIn = true; // Set to true for testing purposes
    let selectedWeek = getWeekNumber();
    let selectedRoom = $('#roomSelect').val();
    let selectedDay = $('#daySelect').val();

    if (isAdminLoggedIn) {
        $('#adminInterface').show();
    }

    populateWeekOptions();
    $('#weekSelect').val(selectedWeek);
    fetchRoomData(selectedWeek, selectedRoom, selectedDay);

    $('#weekSelect, #roomSelect, #daySelect').change(function() {
        selectedWeek = $('#weekSelect').val();
        selectedRoom = $('#roomSelect').val();
        selectedDay = $('#daySelect').val();
        fetchRoomData(selectedWeek, selectedRoom, selectedDay);
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
        
        // Days of the week array
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        daysOfWeek.forEach(day => {
            $.ajax({
                type: 'POST',
                url: '/api/rooms',
                data: JSON.stringify({ room, furnitureName, week, day }),
                contentType: 'application/json',
                success: function(data) {
                    console.log(`Thêm đồ đạc cho ngày ${day} thành công`, data);
                    if (day === selectedDay) {
                        fetchRoomData(week, room, day);
                    }
                },
                error: function(error) {
                    console.error(`Lỗi khi thêm đồ đạc cho ngày ${day}:`, error);
                }
            });
        });

        $('#furnitureName').val('');
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
                const $row = $('<tr>');
                const $statusSelect = $('<select>')
                    .append('<option value="Tốt">Tốt</option>')
                    .append('<option value="Cần sửa">Cần sửa</option>')
                    .append('<option value="Cần thay thế">Cần thay thế</option>')
                    .append('<option value="Cần vệ sinh">Cần vệ sinh</option>')
                    .val(item.status);

                const $noteInput = $('<input type="text">').val(item.note);

                const $completeCheckbox = $('<input type="checkbox">')
                    .prop('checked', item.completed)
                    .change(function() {
                        updateItemStatus(item._id, $statusSelect.val(), $noteInput.val(), $(this).is(':checked'), item.day);
                    });

                $row.append($('<td>').text(item.furnitureName))
                    .append($('<td>').append($statusSelect))
                    .append($('<td>').append($noteInput))
                    .append($('<td>').append($completeCheckbox));

                $tableBody.append($row);
            });
        } else {
            $tableBody.append('<tr><td colspan="4">Không có dữ liệu cho tuần, ngày và phòng này.</td></tr>');
        }
    }

    function updateItemStatus(id, status, note, completed, day) {
        $.ajax({
            url: `/api/rooms/${id}`,
            method: 'PUT',
            data: JSON.stringify({ status, note, completed, day }),
            contentType: 'application/json',
            success: function(data) {
                console.log('Cập nhật trạng thái thành công:', data);
            },
            error: function(error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
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
});
