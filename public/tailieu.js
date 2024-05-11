$(document).ready(function() {
    const uploadModal = $('#uploadModal');
    const uploadForm = $('#uploadForm');
    const documentFileInput = $('#documentFile');
    const documentViewer = $('#documentViewer');

    $('#uploadButton').click(function() {
        uploadModal.show();
    });

    $('.close').click(function() {
        uploadModal.hide();
    });

    uploadForm.submit(function(event) {
        event.preventDefault();
        const formData = new FormData();
        const file = documentFileInput[0].files[0];
        const category = $('#categorySelect').val();

        formData.append('file', file);
        formData.append('category', category);

        $.ajax({
            url: '/api/documents',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('Tài liệu đã được tải lên thành công');
                uploadModal.hide();
                documentFileInput.val(''); // Clear the input after successful upload
                fetchDocuments(category); // Refresh the document list
            },
            error: function(xhr, status, error) {
                alert('Lỗi khi tải lên tài liệu: ' + xhr.responseText);
            }
        });
    });

    function fetchDocuments(category) {
        $.ajax({
            url: `/api/documents/${category}`,
            method: 'GET',
            success: function(data) {
                renderDocumentsTable(data);
            },
            error: function(error) {
                console.error('Lỗi khi lấy tài liệu:', error);
            }
        });
    }

    function renderDocumentsTable(documents) {
        const $documentList = $('#documentList');
        $documentList.empty();

        if (documents.length > 0) {
            documents.forEach(function(doc) {
                const $item = $('<li>')
                    .append(`<a href="#" data-url="${doc.url}" class="view-link">${doc.name}</a>`);
                $documentList.append($item);
            });
        } else {
            $documentList.append('<li>Không có tài liệu nào trong danh mục này.</li>');
        }

        $('.view-link').click(function(event) {
            event.preventDefault();
            const url = $(this).data('url');
            documentViewer.attr('src', url).show();
        });
    }

    $('#categorySelect').change(function() {
        const category = $(this).val();
        fetchDocuments(category);
    });

    // Initial fetch
    fetchDocuments($('#categorySelect').val());
});
