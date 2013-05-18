var app = app || {};

$(function() {
	$("#date").datepicker({format: 'dd/mm/yyyy'});
	$('#priority button.btn:eq(0)').addClass('active');

	// add project - display modal
	$("#add-project").click(function(e) {
		$("#add-project-modal .error").hide();
		$("#add-project-modal").modal('show');
		e.preventDefault();
		return false;
	});
	
	
	
	$("#add-project-modal input").keypress(function(e) {
	    if(e.which == 13) {
	        $("#add-project-modal-save").click();
	    }
	});

	// add project - send request
	$("#add-project-modal-save").click(function() {
		var project_name = $("#add-project-modal input")[0].value;

		$.post("/projects/", {name: project_name}, function(response) {
			if(response.id == undefined) {
				$("#add-project-modal .error").text("Invalid project name");
				$("#add-project-modal .error").show();
				return false;
			}
			console.log(response);
			window.response = response;
			document.location.href = "/dashboard/"+response.id;
		});
	});

	// global esc
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			appView.closeDetails();
		}
	});
	
	// manage user - display modal
	$("#show-manage-user-modal-button").click(function(e) {
		$("#manage-profile-modal .error").hide();
		$("#manage-profile-modal").modal('show');
		e.preventDefault();
		return false;
	});
	
	$("#manage-user-modal-save").click(function(e) {
		var formData = $('#manag-user-form').serialize();
		console.log(formData);
        $.ajax({
                url: '/user',
                type: 'PUT',
                data: formData,
                success: function (response) {
                	console.log("ssss");
                    $('#manage-profile-modal').modal('hide');
                },
                error: function (response) {
               	 	$("#manage-profile-modal .error").text(response.responseText);
					$("#manage-profile-modal .error").show();
                }
        });
		e.preventDefault();
		return false;
	});
	
});
