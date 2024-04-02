document.addEventListener('DOMContentLoaded', function() {
    const removeButtons = document.querySelectorAll('.removeButton');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            console.log(`email: ${email}`);
            removeUser(email);
        });
    });

    function removeUser(email) {
        $.ajax({
            url: '/removeUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({email: email}),
            success: function(response){
                if(response === 'OK'){
                    alert('User deleted successfully');
                    window.location.reload();
                }
                
            },
            error: function(xhr, status, error){
                alert('Problem deleting the user TRY AGAIN');
            }
        });
    }
});